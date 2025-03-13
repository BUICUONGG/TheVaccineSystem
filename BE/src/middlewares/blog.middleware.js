
export const validateSlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ message: "Slug không được cung cấp" });
    }
    
    // Kiểm tra định dạng slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ 
        message: "Slug không hợp lệ. Slug chỉ được chứa chữ thường, số và dấu gạch ngang" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra slug:", error);
    res.status(500).json({ message: "Lỗi server khi kiểm tra slug" });
  }
}; 