// 全局登录状态管理
export class LoginState {
  private static listeners: Set<() => void> = new Set();
  
  static subscribe(callback: () => void) {
    console.log('添加订阅者，当前订阅者数量:', this.listeners.size);
    this.listeners.add(callback);
    console.log('添加后订阅者数量:', this.listeners.size);
    return () => this.listeners.delete(callback);
  }
  
  static login() {
    console.log('LoginState.login() 被调用');
    console.log('当前订阅者数量:', this.listeners.size);
    sessionStorage.setItem('isLoggedIn', 'true');
    console.log('开始通知所有订阅者...');
    this.listeners.forEach((callback, index) => {
      console.log(`通知订阅者 ${index}`);
      callback();
    });
    console.log('所有订阅者已通知');
  }
  
  static logout() {
    sessionStorage.removeItem('isLoggedIn');
    this.listeners.forEach(callback => callback());
  }
  
  static isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }
}
