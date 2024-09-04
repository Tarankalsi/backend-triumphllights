import { DateTime } from "aws-sdk/clients/devicefarm";

export const  formatDateTime = (isoString:DateTime) => {
    const date = new Date(isoString);
    
    // Extract date components
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
  
    // Extract time components
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
  
    // Format the date and time
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  