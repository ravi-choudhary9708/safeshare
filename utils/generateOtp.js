export function generateOtp(length=6){
    const chars='123456789qwertyuioplkjhgfdsazxcvbnmMAQWERTYUIPOLKJHGFDSZXCVB'
    let otp ='';
    for(let i=0;i<length;i++){
        otp+=chars.charAt(Math.floor(Math.random()*chars.length))
      }
      return otp;
}