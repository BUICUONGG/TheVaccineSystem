import bcrypt from "bcryptjs";

// Số vòng băm (càng cao càng bảo mật nhưng tốn CPU)
const SALT_ROUNDS = 2;

/**
 * Băm mật khẩu
 * @param {string} password - Mật khẩu cần băm
 * @returns {Promise<string>} - Mật khẩu đã băm
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * So sánh mật khẩu với hash
 * @param {string} password - Mật khẩu người dùng nhập
 * @param {string} hashedPassword - Mật khẩu đã băm từ database
 * @returns {Promise<boolean>} - Kết quả đúng hoặc sai
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
