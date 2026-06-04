import userRepository from './auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

async function createUser(user) {
  try {
    const { email, nickname, password, passwordConfirm } = user;

    if (!email || !nickname || !password || !passwordConfirm) {
      const error = new Error('이메일, 닉네임, 비밀번호 가 모두 필요합니다.');
      error.code = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('올바른 이메일 형식이 아닙니다.');
      error.code = 400;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error('비밀번호는 8자 이상이어야 합니다.');
      error.code = 400;
      throw error;
    }

    if (password !== passwordConfirm) {
      const error = new Error('비밀번호가 일치하지 않습니다.');
      error.code = 400;
      throw error;
    }

    const existedUser = await userRepository.findByEmail(email);
    if (existedUser) {
      const error = new Error('이메일은 중복된 이메일입니다.');
      error.code = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await userRepository.create({
      email: user.email,
      nickname: user.nickname,
      password: hashedPassword,
    });

    return filterUserData(createdUser);
  } catch (error) {
    throw error;
  }
}

function filterUserData(user) {
  const { password, ...rest } = user;
  return rest;
}

async function loginUser(email, password) {
  try {
    if (!email || !password) {
      const error = new Error('이메일과 비밀번호를 모두 입력해주세요');
      error.code = 400;
      throw error;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('존재하지 않는 이메일입니다.');
      error.code = 404;
      throw error;
    }

    await passwordCheck(password, user.password);

    return filterUserData(user);
  } catch (error) {
    throw error;
  }
}

async function passwordCheck(inputPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  if (!isMatch) {
    const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    error.code = 401;
    throw error;
  }
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: type === 'refresh' ? '1d' : '1h',
  });
  return token;
}

async function refreshToken(userId, refreshToken) {
  try {
    const user = await userRepository.findById(userId);

    const storedToken = await userRepository.findRefreshTokenByUserId(userId);

    if (!user || !storedToken) {
      const error = new Error('토큰이 존재하지 않습니다.');
      error.code = 404;
      throw error;
    }

    if (storedToken.token !== refreshToken) {
      const error = new Error('토큰이 일치하지 않습니다.');
      error.code = 401;
      throw error;
    }

    const newAccessToken = createToken(user);
    const newRefreshToken = createToken(user, 'refresh');

    await userRepository.updateRefreshToken(user.id, newRefreshToken);

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw error;
  }
}

async function updateRefreshToken(userId, token) {
  return userRepository.updateRefreshToken(userId, token);
}

async function deleteRefreshToken(token) {
  return userRepository.deleteRefreshToken(token);
}

export default {
  createUser,
  loginUser,
  createToken,
  updateRefreshToken,
  refreshToken,
  deleteRefreshToken,
};
