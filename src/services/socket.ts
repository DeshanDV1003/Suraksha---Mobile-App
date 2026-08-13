import { io } from 'socket.io-client';

import { SOCKET_URL } from '../config'; // URL managed by start-dev.ps1

class SocketService {
  private socket: any;

  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to Mobile Backend via Socket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket');
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
