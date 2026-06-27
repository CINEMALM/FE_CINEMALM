export const getAgeBadge = (ageRequire?: string) => {
  if (!ageRequire)
    return {
      label: "P",
      color: "#1E90FF",
      text: "Phổ biến",
      description: "Phim được phổ biến rộng rãi cho mọi đối tượng khán giả.",
    };
  const age = ageRequire.toUpperCase().trim();
  if (age === "K")
    return {
      label: "K",
      color: "#32CD32",
      text: "Dành cho trẻ em",
      description:
        "Các tác phẩm được chiếu đến người xem dưới 13 tuổi, với điều kiện phải có sự hướng dẫn từ cha mẹ hoặc người giám hộ.",
    };
  if (age === "P")
    return {
      label: "P",
      color: "#1E90FF",
      text: "Phổ biến",
      description: "Phim được phép phổ biến đến mọi đối tượng khán giả.",
    };
  if (age.includes("13"))
    return {
      label: "13+",
      color: "#FFD700",
      text: "Trên 13 tuổi",
      description:
        "Phim có nội dung hoặc hình ảnh có thể gây ảnh hưởng nhẹ, phù hợp với khán giả từ 13 tuổi trở lên.",
    };
  if (age.includes("16"))
    return {
      label: "16+",
      color: "#FFA500",
      text: "Trên 16 tuổi",
      description:
        "Phim có nội dung hoặc ngôn ngữ phức tạp hơn, phù hợp với khán giả từ 16 tuổi trở lên.",
    };
  if (age.includes("18"))
    return {
      label: "18+",
      color: "#FF4500",
      text: "Trên 18 tuổi",
      description:
        "Phim chỉ dành cho người trưởng thành, có thể chứa bạo lực, tình dục hoặc ngôn ngữ mạnh.",
    };
  return {
    label: "P",
    color: "#1E90FF",
    text: "Phổ biến",
    description: "Phim được phép phổ biến đến mọi đối tượng khán giả.",
  };
};
