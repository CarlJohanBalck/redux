function add(a,b){
    return function(b){
        return a + b;
    };
}

const add2 = a => b => a + b; // 

add(1)(5);