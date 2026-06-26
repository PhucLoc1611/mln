# Kịch bản & Logic vận hành: Game Vòng Sản Xuất – Vòng Giá (Round-based)

**Mục tiêu bài học:** Minh họa trực quan, sinh động quy luật *"Giá cả là biểu hiện bằng tiền của giá trị, luôn xoay quanh trục Giá trị lao động dưới tác động của Cung - Cầu"*.

---

## 1. Thiết lập phân chia (Setup)
* **Tổng số người chơi:** 35 người.
* **Phân nhóm:** Chia thành **7 xưởng/làng nghề** (mỗi nhóm 5 người ngồi quây quần thảo luận).
* **Giao diện người chơi:** Thanh Slider trên điện thoại để chọn sản lượng nộp về hệ thống.
* **Giao diện Admin (Host):** Bảng điều khiển bí mật để thay đổi biến số "CẦU" theo từng vòng chơi.

---

## 2. Quy luật chi phí sản xuất (Giao diện người chơi)
* **Giá trị gốc (Hao phí lao động trung bình):** `10 Gold / 1 mét vải`.
* **Cơ chế chi phí lũy tiến** *(Mô phỏng áp lực tăng ca, máy móc quá tải, năng suất giảm dần)*:
    * Sản xuất từ **1 - 10 mét**: Chi phí là `10 Gold / mét`.
    * Sản xuất từ **11 - 20 mét**: Chi phí tăng lên `13 Gold / mét` (cho các mét từ 11 trở đi).
    * Sản xuất từ **21 - 30 mét**: Chi phí vọt lên `17 Gold / mét` (cho các mét từ 21 trở đi).

👉 **Hành động của nhóm:** Thảo luận nội bộ trong vòng **3 phút** để cân đối chi phí và dự đoán thị trường, sau đó kéo thanh **Slider** chọn sản lượng ($Q$) muốn sản xuất và bấm **[NỘP]**.

---

## 3. Thuật toán xử lý số liệu (Phía Server)
Khi hết thời gian đếm ngược của mỗi vòng, Server tự động khóa cổng nhận lệnh và thực hiện phép tính toán nhẹ theo 4 bước sau:

1.  **Tính tổng Cung thị trường:**
    $$	ext{Tổng Cung} = Q_{	ext{Nhóm 1}} + Q_{	ext{Nhóm 2}} + \dots + Q_{	ext{Nhóm 7}}$$
2.  **Lấy số Cầu thị trường:**
    $$	ext{Cầu} = (	ext{Số lượng do Host cấu hình bí mật cho vòng đó})$$
3.  **Tính Giá thị trường hiện tại:**
    $$	ext{Giá thị trường} = 	ext{Giá trị gốc (10)} 	imes \left( rac{	ext{Cầu}}{	ext{Tổng Cung}} 
ight)$$
4.  **Tính kết quả tài chính trả về điện thoại từng nhóm:**
    $$	ext{Lợi nhuận nhóm} = (	ext{Giá thị trường} 	imes 	ext{Sản lượng nhóm}) - 	ext{Tổng chi phí sản xuất của nhóm}$$

---

## 4. Kịch bản điều phối 4 vòng chơi (Tạo nút thắt bật ngửa)

### 🔴 Vòng 1: Trạng thái cân bằng (Cung = Cầu)
* **Cấu hình Admin:** Thiết lập hệ thống bí mật nhận mức **Cầu = 120 mét**.
* **Tâm lý người chơi:** Vòng đầu tiên mang tính thăm dò, các nhóm thường dè dặt chọn mức sản lượng an toàn, vừa phải (Tổng Cung thực tế của cả lớp sẽ xoay quanh mức `~120 mét`).
* **Kết quả:** Giá thị trường $pprox 10 	imes (rac{120}{120}) = \mathbf{10	ext{ Gold}}$. Các nhóm đều hòa vốn hoặc có lãi nhẹ. 
* **Hiệu ứng:** Tạo tâm lý chủ quan, kích thích lòng tham và sự tự tin của người chơi cho vòng kế tiếp.

### 🔴 Vòng 2: Khủng hoảng thừa (Cung > Cầu) — Cung tăng do lòng tham
* **Cấu hình Admin:** Giữ nguyên mức **Cầu = 120 mét**.
* **Tâm lý người chơi:** Thấy vòng 1 dễ ăn và có lãi, các nhóm đồng loạt "bật chế độ tham lam", kéo mạnh Slider lên tối đa nhằm chiếm lĩnh thị phần và gom nhiều tiền nhất (Tổng Cung cả lớp vọt lên `~200 mét`).
* **Kết quả:** Giá thị trường lập tức sụp đổ: $10 	imes (rac{120}{200}) = \mathbf{6	ext{ Gold}}$.
* **Hậu quả:** Mức giá thị trường ($6	ext{ Gold}$) thấp hơn nhiều so với chi phí sản xuất gốc ($10	ext{ Gold}$). Toàn bộ 7 nhóm rơi vào cảnh lỗ nặng, bảng xếp hạng phủ một màu đỏ rực. Học viên thấm thía bài học đầu tiên về *"Sản xuất ồ ạt, vô tổ chức, cung vượt quá cầu"*.

### 🔴 Vòng 3: Khủng hoảng thiếu (Cung < Cầu) — Cầu tăng do bối cảnh
* **Cấu hình Admin:** Host bấm nút kích hoạt sự kiện: *"Mùa cưới và Lễ hội hoàng gia cận kề"* $
ightarrow$ Hệ thống tăng **Cầu vọt lên 140 mét**.
* **Tâm lý người chơi:** Vừa chịu quả đắng thua lỗ nặng nề ở Vòng 2, các nhóm trở nên sợ hãi, e dè, đồng loạt rụt tay và cắt giảm mạnh sản lượng để bảo toàn số vốn còn lại (Tổng Cung cả lớp tụt sâu xuống `~70 mét`).
* **Kết quả:** Thị trường khan hiếm nghiêm trọng, giá tăng phi mã: $10 	imes (rac{140}{70}) = \mathbf{20	ext{ Gold}}$.
* **Hậu quả:** Nhóm nào gan lỳ hoặc liều lĩnh giữ nguyên mức sản lượng cao ở vòng này sẽ "trúng đậm", thu về khoản lợi nhuận siêu khổng lồ.

### 🔴 Vòng 4: Bài học tự điều tiết (Bàn tay vô hình)
* **Cấu hình Admin:** Đưa biến số **Cầu về lại mức ổn định = 120 mét**.
* **Tâm lý người chơi:** Đã nếm trải đủ cả đau thương (Vòng 2) lẫn mật ngọt (Vòng 3). Người chơi lúc này cực kỳ lý trí. Các nhóm bắt đầu ngó nghiêng, tính toán kỹ lưỡng, tự kiềm chế lòng tham và nỗi sợ. Tổng Cung cả lớp tự động khớp và hội tụ về quanh mức `115 - 125 mét`.
* **Kết quả:** Giá thị trường tự động điều tiết quay về sát mốc **10 Gold** (bằng đúng Giá trị gốc ban đầu).

---

## 5. Kịch bản chốt hạ bài học (Debrief Script dành cho Host)

Khi bạn bấm nút **[KẾT THÚC GAME]**, màn hình lớn của lớp sẽ hiển thị một Biểu đồ đường (Line Chart) trực quan:
* **Trục ngang (X):** Vòng chơi (V1, V2, V3, V4).
* **Trục đứng (Y):** Mức giá (Gold).
* **Đường thẳng cố định (Màu đỏ):** Đường Giá trị gốc cố định ở mốc `10 Gold`.
* **Đường uốn lượn (Màu xanh):** Đường Giá thị trường biến thiên thực tế (`V1: 10` $
ightarrow$ `V2: 6` $
ightarrow$ `V3: 20` $
ightarrow$ `V4: 10`).

### 🎤 Lời thoại chốt hạ của bạn trước cả lớp:

> "Các bạn hãy nhìn lên màn hình lớn. Đây chính là bức tranh toàn cảnh phản chiếu quy luật vận hành của nền kinh tế thị trường thực tế. 
>
> **Đường màu đỏ thẳng tắp** chính là **GIÁ TRỊ** — đại diện cho công sức, thời gian, hao phí lao động và chi phí thực tế để làm ra sản phẩm. Nó chính là cái lõi cứng, là trục xương sống của nền sản xuất. 
>
> **Đường màu xanh nhảy múa uốn lượn** chính là **GIÁ CẢ thị trường** mà chúng ta mua bán, giao dịch hàng ngày. Khi các bạn tham lam sản xuất quá nhiều, đường màu xanh cắm đầu xuống đất. Khi bối cảnh thị trường khan hiếm, nó lại bay vọt lên trời. 
>
> Nhưng các bạn có phát hiện ra quy luật tối cao ở đây không? Dù Cung và Cầu có biến động dữ dội đến đâu, giá cả không bao giờ biến mất vào hư vô hay bay thẳng lên vũ trụ. Nó luôn bị một lực hút vô hình của **GIÁ TRỊ** kéo ghì lại, buộc phải uốn lượn và **XOAY QUANH TRỤC GIÁ TRỊ LAO ĐỘNG**. Đó chính là bản chất cốt lõi của quy luật giá trị mà chúng ta học ngày hôm nay!"
