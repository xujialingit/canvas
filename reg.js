var regex = /hello/;
// console.log(regex.test("hello wrold"))

//横向模糊匹配
regex = /ab{2,5}c/g; // 代表第一个字母是a 第2到5个字符是b 最后一个字符是c
let str = "abc abbc abbbc abbbbc abbbbbbc abbbbbc abbbbbbbbbbbc";
// console.log(str.match(regex));

//纵向模糊匹配
regex = /a[123]c/g //代表第一个字母是a， 最后一个字母是c 第二个是123中的一个  中括号
str = 'a0c a1c a3c a2c a4c a3d';
// console.log(str.match(regex));

//字符组 ： 虽然叫字符组，但是只是其中一个字符， 例如[a,b,c],表示匹配一个字符， 他可以是a b c之一
//范围表示法

regex = /[123456789abcdefGHIJKLMN]/;
regex = /[1-6a-fGH-N]/; //范围表示法 连线符又特殊用途，如果想匹配-的话 必须放在第一位或者最后一位或者转意 : \-
str = "Z";
// console.log(regex.test(str));

// 排除字符组  比如某位字符可以是任何东西，但是就是不能是abc
regex = /[^abc]/g;
str = "avcbd";
// console.log(str.match(regex));  //v ,d

//常见简写方式
regex = /\d/  //[0-9] 
str = "10"; //false

regex = /\D/ // [^0-9];
str = "1" //false

regex = /\w/ // [0-9a-zA-Z] 单词字符
str = "a" //trur
str = "~" //false

regex = /\W/ //[^0-9a-zA-Z] 非单词字符
str = "!" //true
str = "V" //false

regex = /\s/ //空白符
str = "\n" //true
str = "7" //false
regex = /\S/ //非空白符

// console.log(regex.test(str));

//匹配任意字符 [\d\D] [\w\W] [\s\S] [^] 中任意一个

// 量词 {m, n} 也称重复
//简写形式
regex = /{ m, }/


