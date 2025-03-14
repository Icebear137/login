import axios from 'axios';
import { API_CONFIG } from './config';

const api = axios.create(API_CONFIG);

export interface School {
  id: number;
  name: string;
  address: string;
  // Add other school properties as needed
}

export const schoolApi = {
//   getAll: async (): Promise<School[]> => {
//     const response = await api.get('/schools');
//     return response.data;
//   },
};
