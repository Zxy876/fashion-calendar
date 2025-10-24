// src/utils/backup.js
export const backupService = {
  // 导出所有数据
  exportData: () => {
    const events = localStorage.getItem('calendar-events');
    const data = {
      events: events ? JSON.parse(events) : [],
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  // 导入数据
  importData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.events && Array.isArray(data.events)) {
            localStorage.setItem('calendar-events', JSON.stringify(data.events));
            resolve('数据导入成功');
          } else {
            reject('无效的数据格式');
          }
        } catch (error) {
          reject('文件解析失败');
        }
      };
      reader.onerror = () => reject('文件读取失败');
      reader.readAsText(file);
    });
  }
};