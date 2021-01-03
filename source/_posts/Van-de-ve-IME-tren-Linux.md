---
title: Vấn đề về IME trên Linux
tags: ["vietnamese", "algo"]
date: 2020/07/21
---

Một vấn đề muôn thuở của những IME hỗ trợ gõ tiếng Việt trên Linux là việc tương thích phương pháp gõ với cả ứng dụng lẫn người dùng.
<!-- more -->

Theo bài viết của đại ca Huy Trần vào năm 2017<sup>[\[1\]][1]</sup> thì hiện tại, có 2 phương pháp mà các IME đang dùng trên linux:

> **Preedit:** là cách gõ xuất hiện dấu gạch đít, đây thực chất là một vùng buffer lưu tạm các kí tự đang gõ, thay thế nó, ví dụ aa đưọc thay thành â, khi ngưòi dùng nhấn space để kết thúc từ đang gõ thì nó sẽ commit từ đó về cho UI của ứng dụng. Các bộ gõ tiếng Việt sử dụng kĩ thuật này thì có: ibus-unikey, bộ gõ tiếng Việt mặc định của macOS,...
  **Backspace giả:** là cách gõ không xuất hiện dấu gạch đít, cơ chế hoạt động của giải pháp này là khi gõ các kí tự tiếng việt như aa, bộ gõ sẽ tự động gửi 2 dấu backspace vào ứng dụng, và gửi tiếp một kí tự â thay thế. Các bộ gõ sử dụng kĩ thuật này có ibus-bogo, fcitx-bogo, GoTiengViet trên macOS,...

Tất nhiên nếu ai đã từng chập chững bắt đầu gõ tiếng Việt bằng Unikey trên Windows thì chắc hẳn cũng hiểu cái cảm giác sung sướng khi đi đâu gõ cũng ăn và không có cái dấu gạch đít khó chịu hay cái cảm giác hoảng chít mịa khi nhận ra mình vừa gõ status facebook bằng [Unikey giả mạo][2] và chắc thằng hacker nó biết hết chuyện mình nói xấu rồi :sob:

Chính vì cái cảm giác khó chịu mà cái gạch đít của preedit mang lại mà các bộ IME luôn muốn hướng tới phương pháp backspace giả. Nhưng vấn đề lớn ở đây là không phải ứng dụng nào cũng hoạt động tốt với phương pháp backspace.

Ví dụ điển hình là việc [ibus-bamboo][3]-bộ gõ tiếng Việt duy nhất ở thời điểm hiện tại vẫn còn active, đã phải bổ sung tổ hợp <kbd>Shift</kbd> + <kbd>~</kbd> để chuyển đổi giữa các phương pháp gõ cho từng ứng dụng khác nhau. Trên README của ibus-bamboo có nói rõ vấn đề này:

![](ibus_bamboo_notice.png)
*Phần lưu ý trên trang README của ibus-bamboo*

Đều này tạo ra sự bất tiện cho người sử dụng và vì thế ibus-bamboo, dù có thể nói là IME hiện đại nhất ở thời điểm bấy giờ nhưng vẫn vướng phải những vấn đề của những tiền bối đi trước: không tương thích với tất cả mọi ứng dụng và gây nhiều bất tiện cho người dùng.

# Trải nghiệm của mình

Dạo gần đây mình có thử làm một IME bằng Rust, lý do cho việc này thì mình có nói ở [bài này][4]. Điều đầu tiên mình xác định khi bắt tay làm là phải tập trung giải quyết được những vấn đề nói trên vì nếu không thì khác nào mình làm ibus-bamboo thứ 2. Vì vậy, mình bắt đầu thử nghiệm với evdev và uinput để receive và send key.

## Evdev và uinput

Thế evdev và uinput là cái quái gì? Một chiêu mà mình học khi làm 1 dự án công ty đó là bạn có thể listen event mà Linux nhận được từ hardware thông qua evdev. Theo wiki<sup>[\[2\]][5]</sup> thì evdev là một interface dùng để translate input từ hardware sang 1 dạng format chung mà các application có thể dùng để xử lý. Nói theo ngôn ngữ front-end webdev thì evdev như một API server cho phép đọc data từ hardware và thay vì dùng JSON, evdev có một chuẩn riêng để return dữ liệu về. Đặc biệt, evdev nhận event trước cả X server:

> It sits below the process that handles input events, in between the kernel and that process.

    kernel → libevdev → xf86-input-evdev → X server → X client

Bằng cách sử dụng evdev, key input sẽ được nhận thẳng từ kernel nên việc X sever có dở chứng mà ignore key input đi chăng nữa cũng chẳng lo và việc receive key input sẽ hoạt động trên mọi ứng dụng.

Vậy còn uinput là gì? Theo một bài giải thích mình tìm được<sup>[\[3\]][6]</sup> thì uinput đơn giản là một kernel module, support cho directory `/dev/uinput` và bất kì process nào cũng có thể write custom event vào đó. Khi nhận được event, uinput sẽ tạo một device ảo ở directory `/dev/input` và broadcast event từ device đó. Vì mọi event ở `/dev/input` sẽ được send tới tất cả ứng dụng nên việc send fake key input từ IME sẽ hoạt động trên mọi ứng dụng bất kể là gtk hay qt.

**tldr/dqdd:** Evdev sử dụng để listen key event ở mọi ứng dụng và uinput dùng để send key event giả tới mọi ứng dụng.

### Vấn đề 1: Sudo

![](sudo_meme.jpg)

Vì evdev có thể listen key ở toàn bộ mọi ứng dụng, nên IME sẽ chả khác gì một con keylogger cả. Vì vậy, Linux bắt buộc phải có quyền sudo để sử dụng evdev. Uinput cũng cần quyền root vì lý do tương tự. Điều này không phải là vấn đề quá nhạy cảm vì nếu muốn làm keylogger thì hoàn toàn có thể dùng X11 mà không cần quyền root<sup>[\[4\]][7]</sup>. Nhưng nếu lỡ không may cần xài trên máy trường hoặc máy công cộng không có quyền root thì điều này là khá bất tiện.

### Vấn đề 2: Sai người nhận

UInput không phân biệt được window đang cần nhận event. Một trường hợp khá hiếm xảy ra là khi đang gõ thì bổng có 1 pop-up xuất hiện. Vì uinput tạo ra một keyboard ảo và key send được send tới nơi có focus nên mọi fake key từ IME sẽ được gửi vào pop-up. Tuy đây không phải là vấn đề lớn nhưng nếu có 1 trang phishing nào đó tạo pop-up quăng lên và IME send nguyên mớ thông tin nhạy cảm vào thì khá là đau lòng.

### Vấn đề 3: Compose key

Nếu uinput tạo ra keyboard giả thì làm sao có thể send được các kí tự tiếng Việt? tất nhiên là sử dụng phương pháp [compose key][8]. Compose key là phương pháp mà khi gõ tổ hợp <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>u</kbd> và hex của kí tự mà bạn muốn send, X server sẽ compose ra kí tự mà bạn muốn. Hồi còn nhỏ xài winxp mình hay dùng trò này để nhập zero width character phối hợp với empty folder icon để tạo folder ẩn đựng "bài tập" :lenny:.

Nhưng vấn đề ở đây là quá trình compose sẽ chỉ được hoàn tất khi bạn release tất cả các phím. Điều này dẫn tới việc đôi lúc key tiếp theo bạn gõ bị ăn vào quá trình compose và tạo ra kí tự sai. Muốn giải quyết vấn đề này, bạn cần đợi IME compose key xong trước khi gõ phím tiếp theo. Việc này tạo ra một khoảng delay lớn khi gõ phím vô cùng bất tiện.

## X11

Mình cũng đã thử dùng X11 API để listen và send key nhưng vẫn gặp nhiều vấn đề khó giải quyết.

Cụ thể như việc để send một kí tự unicode thì trước hết cần phải map kí tự ấy vào 1 phím trên X11 keyboard layout bằng API `XChangeKeyboardMapping` và send key đó bằng `XTestFakeKeyEvent`. Vấn để ở đây là `XChangeKeyboardMapping` cần một khoảng delay để apply key và trước khi key kịp apply thì `XTestFakeKeyEvent` đã send key đi mất. Nếu đợi `XChangeKeyboardMapping` map xong key rồi mới send thì sẽ tạo ra một khoảng delay giữa các phím nên gõ rất cụt hứng.

Thêm một điểm khá khó chịu là API của X11 vô cùng lộn xộn, đến giờ mình vẫn không rõ `XFlush`, `XSync` và `XSynchronize` thực sự làm gì.

# Kết

Nói thế chứ post này chủ yếu để ghi lại những khó khăn mình đi qua chứ không có ý doạ những bạn có ý định xây dựng IME. Nếu các bạn cũng có ý định phát triển một bộ IME trên Linux, sử dụng những kĩ thuật tân tiến hơn thì có thể tham khảo library mà mình tạo ra để giúp các bạn bớt đi gánh nặng về logic của engine và chỉ cần tập trung vào key sending và receiving:

https://github.com/ZeroX-DG/vi-rs

# Tham khảo

1. Thefullsnack. (2017). [Chuyện gõ tiếng Việt trên Linux][1].
2. Wikipedia. (2020). [evdev][5].
3. Peter Hutterer. (2016). [The difference between uinput and evdev][6].
4. Vojtech Pavlik. (2001). [Linux Input Subsystem userspace API][9].
5. The kernel development community. (2020). [uinput module][10]

[1]: https://thefullsnack.com/posts/go-tieng-viet-linux.html
[2]: https://thanhnien.vn/cong-nghe/canh-giac-bo-go-unikey-gia-mao-chiem-doat-quyen-dieu-khien-may-tinh-1156174.html
[3]: https://github.com/BambooEngine/ibus-bamboo
[4]: /blog/2020/07/14/Bo-dau-trong-tieng-Viet/
[5]: https://en.wikipedia.org/wiki/Evdev
[6]: http://who-t.blogspot.com/2016/05/the-difference-between-uinput-and-evdev.html
[7]: https://github.com/anko/xkbcat
[8]: https://en.wikipedia.org/wiki/Compose_key
[9]: https://www.kernel.org/doc/html/latest/input/input.html
[10]: https://www.kernel.org/doc/html/latest/input/uinput.html
