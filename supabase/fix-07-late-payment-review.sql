-- Apply after fix-06 in the Supabase SQL Editor.
-- Payments that arrive after a stock hold ends must acquire stock again.
begin;

create or replace function public.release_expired_reservations() returns void
language plpgsql security definer set search_path = public as $$
declare
  o record;
begin
  for o in
    select id from public.orders
    where payment_status = 'pending' and reservation_active and expires_at <= now()
    order by id
    for update skip locked
  loop
    update public.variants v set reserved = greatest(v.reserved - s.qty, 0)
    from (select product_id, color, size, sum(qty) as qty from public.order_stock
          where order_id = o.id group by product_id, color, size) s
    where (v.product_id, v.color, v.size) = (s.product_id, s.color, s.size);
    update public.orders set reservation_active = false, payment_status = 'expired' where id = o.id;
  end loop;
end $$;

-- The caller holds the order lock. Conditional stock updates preserve other
-- orders' holds. Roll back every component if any item cannot be allocated.
create or replace function public.allocate_unreserved_order_stock(p_order_id uuid) returns boolean
language plpgsql set search_path = public as $$
declare
  v_needed int;
  v_allocated int;
begin
  with needed as (
    select product_id, color, size, sum(qty) as qty
    from public.order_stock where order_id = p_order_id
    group by product_id, color, size
  ), allocated as (
    update public.variants v set stock = v.stock - n.qty
    from needed n
    where (v.product_id, v.color, v.size) = (n.product_id, n.color, n.size)
      and v.stock - v.reserved >= n.qty
    returning v.id
  )
  select (select count(*) from needed), (select count(*) from allocated)
    into v_needed, v_allocated;

  if v_needed = 0 or v_allocated <> v_needed then
    raise no_data_found;
  end if;
  return true;
exception when no_data_found then
  return false;
end $$;

create or replace function public.mark_order_paid(p_order_number text, p_reference text,
  p_amount_kobo bigint, p_currency text, p_channel text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  v_late boolean;
  v_needs_review boolean := false;
begin
  select * into o from public.orders where order_number = p_order_number for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'order_not_found'); end if;
  if o.paystack_reference is distinct from p_reference then
    return jsonb_build_object('ok', false, 'reason', 'reference_mismatch');
  end if;
  if o.payment_status = 'paid' then return jsonb_build_object('ok', true, 'already', true); end if;
  if p_amount_kobo is distinct from o.total_ngn::bigint * 100 or upper(coalesce(p_currency,'')) <> 'NGN' then
    update public.orders set review_flag = 'amount_or_currency_mismatch' where id = o.id;
    return jsonb_build_object('ok', false, 'reason', 'amount_mismatch');
  end if;

  v_late := not o.reservation_active or o.expires_at <= now();
  if o.reservation_active then
    update public.variants v
    set reserved = greatest(v.reserved - s.qty, 0),
        stock = case when v_late then v.stock else v.stock - s.qty end
    from (select product_id, color, size, sum(qty) as qty from public.order_stock
          where order_id = o.id group by product_id, color, size) s
    where (v.product_id, v.color, v.size) = (s.product_id, s.color, s.size);
  end if;
  if v_late then
    v_needs_review := not public.allocate_unreserved_order_stock(o.id);
  end if;

  update public.orders
  set payment_status = 'paid', paid_at = now(), reservation_active = false,
      payment_channel = p_channel,
      fulfilment_status = case when v_needs_review then 'new' else fulfilment_status end,
      review_flag = case
        when v_needs_review then 'late_payment_out_of_stock'
        when v_late then 'paid_after_reservation_expired'
        else o.review_flag
      end
  where id = o.id;
  return jsonb_build_object('ok', true, 'already', false);
end $$;

-- Admins resolve stock review here instead of bypassing allocation with a
-- fulfilment-status change. Cancelling records a refund already handled in Paystack.
create or replace function public.resolve_late_payment_stock_review(p_order_id uuid, p_action text)
returns text language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
begin
  if not public.is_admin() then
    raise insufficient_privilege using message = 'Admin access required';
  end if;
  if p_action is null or p_action not in ('approve', 'cancel') then
    raise invalid_parameter_value using message = 'Invalid stock review action';
  end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found or o.payment_status <> 'paid' or o.review_flag is distinct from 'late_payment_out_of_stock' then
    return 'not_under_review';
  end if;

  if p_action = 'cancel' then
    update public.orders set fulfilment_status = 'cancelled', review_flag = 'late_payment_refund_recorded'
    where id = o.id;
    return 'cancelled';
  end if;
  if not public.allocate_unreserved_order_stock(o.id) then return 'stock_unavailable'; end if;
  update public.orders set fulfilment_status = 'processing', review_flag = null where id = o.id;
  return 'approved';
end $$;

alter policy p_orders_admin_update on public.orders using (public.is_admin())
with check (public.is_admin() and case review_flag
  when 'late_payment_out_of_stock' then fulfilment_status = 'new'
  when 'late_payment_refund_recorded' then fulfilment_status = 'cancelled'
  else true
end);

create or replace function public.get_order_for_token(p_order_number text, p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders where order_number = p_order_number and public_token = p_token;
  if not found then return null; end if;
  return jsonb_build_object(
    'order_number', o.order_number, 'payment_status', o.payment_status,
    'fulfilment_status', o.fulfilment_status,
    'stock_review_status', case o.review_flag
      when 'late_payment_out_of_stock' then 'pending'
      when 'late_payment_refund_recorded' then 'cancelled'
    end,
    'total_ngn', o.total_ngn, 'subtotal_ngn', o.subtotal_ngn, 'shipping_ngn', o.shipping_ngn,
    'email', o.customer_email, 'name', o.customer_name, 'phone', o.customer_phone,
    'ship_line1', o.ship_line1, 'ship_city', o.ship_city, 'ship_state', o.ship_state,
    'created_at', o.created_at, 'paid_at', o.paid_at, 'is_test', o.is_test,
    'reference', o.paystack_reference, 'channel', o.payment_channel,
    'exchange_rate', o.exchange_rate, 'receipt_sent', o.receipt_sent_at is not null,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.product_name, 'color', i.color,
       'size', i.size, 'qty', i.qty, 'unit_ngn', i.unit_ngn, 'line_ngn', i.line_ngn, 'is_preorder', i.is_preorder)), '[]'::jsonb)
       from public.order_items i where i.order_id = o.id));
end $$;

-- Existing Edge Functions use this claim before sending the confirmation email.
create or replace function public.claim_receipt(p_order_number text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
begin
  update public.orders set receipt_sent_at = now(), receipt_error = null
  where order_number = p_order_number and payment_status = 'paid' and receipt_sent_at is null
    and review_flag is distinct from 'late_payment_out_of_stock'
    and review_flag is distinct from 'late_payment_refund_recorded'
  returning * into o;
  if not found then return null; end if;
  return public.get_order_for_token(o.order_number, o.public_token)
         || jsonb_build_object('token', o.public_token);
end $$;

revoke all on function public.allocate_unreserved_order_stock(uuid) from public, anon, authenticated;
revoke all on function public.resolve_late_payment_stock_review(uuid,text) from public, anon, authenticated;
grant execute on function public.resolve_late_payment_stock_review(uuid,text) to authenticated;

revoke all on function public.release_expired_reservations(), public.mark_order_paid(text,text,bigint,text,text),
  public.get_order_for_token(text,text), public.claim_receipt(text) from public, anon, authenticated;
grant execute on function public.release_expired_reservations(), public.mark_order_paid(text,text,bigint,text,text),
  public.get_order_for_token(text,text), public.claim_receipt(text) to service_role;

commit;
