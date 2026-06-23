# Thực hành với git

- `git pull` từ nhánh chính để liên tục lấy code mới nhất.
- `git branch -M ten_nhanh` nếu muốn phát triển tính năng mới hoặc fix bug
- Sau khi thay đổi xong hoàn thiện chức năng kiểm tra xem mình đã có ở nhánh đúng mình tách ra chưa và `git add .` đóng gói sự thay đổi của file code vào.
- `git commit -m "tên tin nhắn muốn gửi kèm sự thay đổi"`.
- `git push origin ten_nhanh` cập nhật lại nhánh trên git.

- Nếu nhánh chính có sự thay đổi mà mình cần sự thay đổi đấy để làm việc tiếp thì sẽ sử dụng câu lệnh `git merge origin ten_nhanh`. Nếu có conflict xử lý và add các sự thay đổi và commit với tin nhắn là sửa conflict.
