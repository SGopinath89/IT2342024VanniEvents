import { userService } from "@/services/user";
import errorHandler from "@/utils/error-handler";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
  const { role } = req.query;

  try {
    const users = await userService.getAllUsers(role);
    res.status(200).json(users);
  } catch (error) {
    errorHandler(error, res);
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    errorHandler(error, res);
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await userService.getUserByEmail(email);
    res.status(200).json(user);
  } catch (error) {
    errorHandler(error, res);
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const user = req.user;

  try {
    const updatedUser = await userService.updateUser(id, payload, user);
    delete updatedUser.password;

    res.status(200).json(updatedUser);
  } catch (error) {
    errorHandler(error, res);
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await userService.getUserById(id);

    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    await userService.changePassword(id, newPassword);

    res.status(204).json({ message: "Password changed" });
  } catch (error) {
    errorHandler(error, res);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await userService.deleteUser(id);
    res.status(204).json({ message: "User deleted" });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const userController = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  changePassword,
};
