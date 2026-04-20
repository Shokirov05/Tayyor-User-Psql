import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  FindOptionsWhere ,ILike } from 'typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enum/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

async create(dto: CreateUserDto): Promise<User> {
  const exists = await this.userRepository.findOne({
    where: { email: dto.email },
  });

  if (exists) throw new ConflictException('Email already exists');

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    password: hashedPassword,
    role: UserRole.USER, // 🔥 majburiy default
  });

  return this.userRepository.save(user);
}

async findAll(query: FindUsersDto): Promise<Partial<User>[]> {
  const limit = query.limit ?? 10;

  const where: FindOptionsWhere<User> = {};

if (query.firstName?.trim()) {
  where.firstName = ILike(`%${query.firstName.trim()}%`);
}

if (query.lastName?.trim()) {
  where.lastName = ILike(`%${query.lastName.trim()}%`);
}

  return this.userRepository.find({
    select: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
    where: Object.keys(where).length ? where : undefined,
    take: limit,
    order: { createdAt: 'DESC' },
  });
}

  async findOne(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // 🔥 email conflict check
    if (dto.email) {
      const exists = await this.userRepository.findOne({
        where: {
          email: dto.email,
          id: Not(id),
        },
      });

      if (exists) throw new ConflictException('Email already in use');
    }

    // 🔐 password hash
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByEmail(email: string) {
  return this.userRepository.findOne({ where: { email } });
}

async findById(id: string) {
  return this.userRepository.findOne({ where: { id } });
}

async save(user: User) {
  return this.userRepository.save(user);
}
}