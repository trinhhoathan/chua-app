-- Địa chỉ đã dịch Hán/Nôm để in sớ
alter table public.so_households
  add column if not exists dia_chi_nho text;
