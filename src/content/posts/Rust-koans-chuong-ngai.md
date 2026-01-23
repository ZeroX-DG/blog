---
title: "Rust Koan: Những Chướng Ngại"
tags: ["rust", "vietnamese"]
date: 2023/11/09
description: Dịch lại một đoạn koan về rust trong lúc cao hứng.
---

Dịch lại từ: https://users.rust-lang.org/t/rust-koans/2408#obstacles-1

Với sự hỗ trợ của: [Từ điển Hán Nôm](https://hvdic.thivien.net/), [Claude Instant](https://poe.com/) và [ChatGPT](https://openai.com/blog/chatgpt).

---

Đã là ngày thứ tám ngày liên tiếp, Tân Đạo Sĩ Col (Neophyte Col) thấy mình đứng trước hai vị vệ binh trường lão của ngôi tự miếu. Họ đứng canh gác lối vào rộng lớn của đạo quán, mặc y phục bình dân. Tuy vậy, khí chất của bọn họ rất oai nghiêm, làm người ta không dám cất tiếng. Col bước tới gần vệ binh đầu tiên với vẻ tự tin, rồi đưa tờ giấy ghi chương trình của mình.

Vệ binh thứ nhất kĩ lưỡng đọc qua. Bước này chỉ là mang tính thủ tục; hôm qua, Col chỉ thất bại thuyết phục vệ binh thứ hai. Hắn ta chắc chắn lần này, bản thân đã giải quyết hết thảy mọi phàn nàn tồn đọng.

Vệ binh thứ nhất trả lại tấm giấy cho Col. Rồi bằng một cử động gọn lẹ, hắn ta một tay vung lên tát mạnh vào mặt Col. Bằng giọng đều đều, vệ binh thứ nhất nói: "Kiểu dữ liệu không khớp nhau: kiểu mong đợi là `&Target`, còn kiểu thực tế là `&<T as Deref>::Target`", rồi im lặng.

Col cầm tờ giấy của mình lui về một băng ghế gần đó, hai mắt gần ngấn lệ. *Tám ngày*. Chương trình chẳng mấy phức tạp, vậy mà hắn vẫn không cách nào thuyết phục được hai vệ binh cho phép vào đền. Hắn chưa từng gặp khó khăn như vậy ở những đền khác!

Tại một băng ghế nọ, hắn trông thấy một tân đạo sĩ khác. Hai ngày trước, họ đã trao đổi vài câu, khi ấy hắn được biết đạo hữu của mình đã phải cực khổ ngoài đền thờ gần gần hai tuần trời để chương trình của y được chấp thuận.

Đều là lỗi của hai vệ binh kia. Col biết chương trình của mình sẽ hoạt động như ý. Hai người kia chỉ luôn tìm những lỗi nhỏ nhặt, từ chối hắn bằng những lí do tầm thường nhất. Họ chỉ muốn tìm cớ để cấm đoán hắn thôi; ắt hẳn như vậy!

Trong lòng hắn oán hờn dâng trào.

Lúc bấy giờ, hắn chú ý thấy một vị tăng nhân đang đối thoại với vị đạo hữu kia. Cuộc trao đổi có vẻ sôi nổi, bỗng người đạo hữu ấy phát ra một tiếng reo mừng, bật dậy như phục sinh, lao thẳng vào đền. Vừa phi chạy như bay, hắn ta vừa điên cuồng sửa đổi chương trình của mình.

Tuy nhiên, thay vì đối đầu hai vệ binh, hắn lại tiến về một góc tường bẩn thỉu. Không ngờ bức tường mở ra một lối vào bí mật. Gã đạo sĩ kia xuyên qua bức tường, biến mất khỏi tầm mắt Col.

Col kinh ngạc khôn cùng. Một lối vào bí mật? Vậy thì….. hai tên vệ binh kia ắt hẳn chỉ là một trò đùa! Các vị đại sư khác chắc đã dùng thủ đoạn này để rèn giũa niềm khiêm cung cho các môn sinh. Hoặc là....hoặc là...cũng có thể chỉ là muốn cười cợt họ từ bên trong mà thôi!

Một giọng nói vang lên "Ngươi có muốn biết ta đã nói gì với hắn?". Col xoay người, thấy vị tăng nhân lúc nãy đã đứng bên băng ghế hắn ngồi. "Sư đã chỉ đường vào khác cho hắn?"

"Đúng vậy," vị tăng nhân đáp. "Ta đã tiết lộ với hắn về Tử Huyệt Môn.”

“Tử Huyệt (`unsafe`)?” Col không giấu được vẻ tòm mò.

Chính xác là như vậy, đó là bí mật mà chỉ kẻ nào luyện tập lâu năm tại đạo quán mới có thể biết. Thực chất, chỉ cần dùng đến thủ pháp Tử Huyệt được nhắc đến trong Tú Kim Học Kinh ngữ kỳ 280 ([Rustonomicon 280][1]), người ta có thể vượt qua được nhiều chướng ngại khi soạn thảo chương trình của mình.

Col ngạc nhiên hỏi: "Những thủ pháp ấy lợi hại thật vậy sao?”

“Vô cùng lợi hại! Chỉ cần dùng Phá Thân Biến Hóa ([`transmute`][2]), là có thể thay mới kiểu dữ liệu, hay kéo dài thọ mệnh ([`lifetime`][3]) của thỉnh chỉ (`pointer`). Ngay cả triệu hồi thỉnh chỉ từ không trung, hay dữ liệu từ hư không cũng chẳng phải là chuyện lạ!”

Col cảm thấy bản thân cuối cùng cũng hiểu ra phương thức hoạt động của miếu đường. Chính thủ pháp "Tử Huyệt" ma thuật này là công cụ bí truyền của các cao tăng! Tuy nhiên…

"Nếu người ta có thể đơn giản bước qua Tử Huyệt Môn là có thể vào được miếu đường, thì tại sao lại cần có hai vị cảnh vệ hùng mạnh bảo vệ cửa? Sao không...”

Lúc bấy giờ, một tiếng la thất thanh vang lên từ bên trong ngôi đền. Âm thanh kinh hoàng vang dội khắp sân đền, rồi bỗng đột ngột dừng lại.

Bầu không khí im lặng buông xuống. Không ai dám động đậy. Không ai dám lên tiếng. Cơn gió cũng ngừng thổi. Mọi chim trời đều ngừng hót.

Col cảm thấy nhịp tim dồn dập bên tai.

"Hai người họ canh cửa," vị sư nói, phá tan bầu không gian tĩnh lặng, "chính là để bảo vệ ngươi, khỏi ngôi đền và những thứ bên trong.”

Col xoay người nhìn lại góc tường ẩn chứa lối vào bí mật. “Vậy tại sao cánh cửa kia lại tồn tại?”

"Bởi lẽ, nhân vô thập toàn, ngay cả hai vệ binh kia cũng khó tránh phải sai lầm. Đôi khi người ta phải tự mình đối mặt với hiểm nguy.” Vị tăng nhân thở dài. "Nhưng không phải ai cũng gan dạ và tinh thông tuyệt kỹ được như vậy.”

Sau lời ấy, vị tăng nhân từ trong trường bào lấy ra một tấm giấy rồi bước đến chỗ hai vệ binh. Vệ binh thứ nhất nhìn qua chương trình của bà và gật đầu. Vệ binh thứ hai cũng nhìn qua chương trình, trả lại rồi liền ra tay tát mạnh vào mặt bà.

“Giá trị vay mượn không tồn tại đủ lâu!”

Vị tăng nhân xoa mặt, quay về ngồi xuống băng ghế, lẩm bẩm lời chửi rủa.

Lúc này, Col đã lập tức giác ngộ.

[1]: https://doc.rust-lang.org/nightly/nomicon/
[2]: https://doc.rust-lang.org/std/mem/fn.transmute.html
[3]: https://doc.rust-lang.org/rust-by-example/scope/lifetime.html