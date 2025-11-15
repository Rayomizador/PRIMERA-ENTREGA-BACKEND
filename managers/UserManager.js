import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserManager {
  constructor(filePath) {
    this.path = path.join(__dirname, '..', 'data', filePath);
  }

  async _readData() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async _writeData(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getAll() {
    return this._readData();
  }

  async getByEmail(email) {
    const users = await this._readData();
    return users.find(u => u.email === email) || null;
  }

  async getById(id) {
    const users = await this._readData();
    return users.find(u => u.id === id) || null;
  }

  async createUser({ first_name, last_name, email, age, password, cart = null, role = 'user' }) {
    if (!first_name || !last_name || !email || age === undefined || !password) {
      throw new Error('Todos los campos obligatorios deben ser proporcionados.');
    }

    const users = await this._readData();
    if (users.some(u => u.email === email)) {
      throw new Error(`Ya existe un usuario con el email ${email}.`);
    }

    const hashed = bcrypt.hashSync(password, 10);

    const newUser = {
      id: randomUUID(),
      first_name,
      last_name,
      email,
      age: Number(age),
      password: hashed,
      cart,
      role: role || 'user'
    };

    users.push(newUser);
    await this._writeData(users);

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async updateUser(id, fields) {
    const users = await this._readData();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`Usuario con id ${id} no encontrado.`);

    // No permitir cambio directo del id ni colisión de email
    delete fields.id;
    if (fields.email && users.some(u => u.email === fields.email && u.id !== id)) {
      throw new Error(`Ya existe un usuario con el email ${fields.email}.`);
    }

    if (fields.password) {
      fields.password = bcrypt.hashSync(fields.password, 10);
    }

    users[idx] = { ...users[idx], ...fields };
    await this._writeData(users);
    const { password, ...safeUser } = users[idx];
    return safeUser;
  }

  async deleteUser(id) {
    const users = await this._readData();
    const initial = users.length;
    const remaining = users.filter(u => u.id !== id);
    if (remaining.length === initial) throw new Error(`Usuario con id ${id} no encontrado para eliminar.`);
    await this._writeData(remaining);
    return { id };
  }
}

export const userManager = new UserManager('users.json');
