//SNA 

const logger = param => store => next => action => {
    if(action.type === 'error'){
        console.log("Toastify: ", param);
    }
    else{
        console.log("Logging", param);
    }
    
  
    return next(action);
    // logger -> toast -> api
}

export default logger;

// Currying
// N => 1