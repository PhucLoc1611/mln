# Vòng sản xuất - Vòng giá

Game ôn tập kinh tế chính trị cho lớp học: 7 xưởng chọn sản lượng, host điều phối Cầu, app tính Giá thị trường và lợi nhuận theo từng vòng.

## Chạy local

```bash
pnpm install
pnpm dev
```

Mở `http://localhost:3000`, tạo phòng host rồi cho các nhóm quét QR hoặc nhập link `/team/[roomCode]`.

## Deploy Vercel

- Import thư mục này lên Vercel.
- Không cần biến môi trường.
- Bản v1 dùng in-memory room store trong Next.js Route Handlers: phù hợp chơi nhanh trong lớp, không lưu bền sau cold start/redeploy.

## Luật chính

- 6 vòng, mỗi vòng 90 giây.
- Giá trị gốc: `10 Gold / mét`.
- Chi phí: `1-10m = 10`, `11-20m = 13`, `21-30m = 17`.
- Giá thị trường: `10 x Cầu / Tổng Cung`.
