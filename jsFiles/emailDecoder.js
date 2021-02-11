// =?UTF-8?Q? 형태를 받는 방법
// const rfc2047 = require('rfc2047');
// let subjectLine = `=?UTF-8?Q?[Kakao]_=EC=B9=B4=EC=B9=B4=EC=98=A4=EA=B3=84=EC=A0=95?=
// =?UTF-8?Q?_=EA=B0=80=EC=9E=85_=EC=9D=B8=EC=A6=9D=EB=B2=88=ED=98=B8?=`
// let frenchSubjectLine = rfc2047.decode(subjectLine);
// console.log("FR subject line after decoding: [" + frenchSubjectLine + "]");



const data = `7Lm07Lm07Jik6rOE7KCVDQotLS0tDQoNCuy5tOy5tOyYpOqzhOyglSDqsIDs
noXsnYQg7JyE7ZWcIOyduOymneuyiO2YuOyeheuLiOuLpC4NCg0KLSDsnbjs
pp3rsojtmLggOiA2MTgyODAyMg0KDQoNCi0tLS0NCuuzuCDrqZTsnbzsnYAg
67Cc7Iug7KCE7Jqp7J6F64uI64ukLlxu7Lm07Lm07Jik6rOE7KCVIOq0gOug
qO2VmOyXrCDqtoHquIjtlZwg7KCQ7J20IOyeiOycvOyLnOuptCDrj4Tsm4Dr
p5DsnYQg7ZmV7J247ZW0IOuztOyEuOyalC4NCi0g66eB7YGsIDogaHR0cHM6
Ly9jcy5rYWthby5jb20vaGVscHM/bG9jYWxlPWtvJnNlcnZpY2U9NTINCg0K
Q29weXJpZ2h0IChjKSBLYWthbyBDb3JwLiBBbGwgcmlnaHRzIHJlc2VydmVk
Lg0KDQo=`

let buff = new Buffer.from(data, 'base64').toString();
console.log(buff);

//kakadosi1352@adiy.io
//kakadosi1352@daum.net
// dk