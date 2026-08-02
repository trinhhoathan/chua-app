-- App cho phép tối thiểu 1 thùng; RLS cũ còn quantity >= 10 → chặn tạo đơn.
DROP POLICY IF EXISTS "Public can create pending orders" ON public.water_orders;

CREATE POLICY "Public can create pending orders"
  ON public.water_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending_payment'
    AND quantity >= 1
    AND quantity <= 100000
    AND unit_price > 0
    AND total_amount = (quantity::bigint * unit_price::bigint)
    AND EXISTS (
      SELECT 1
      FROM public.temples t
      WHERE t.id = water_orders.temple_id
        AND t.is_active = true
    )
  );
