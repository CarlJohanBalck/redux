import {combineReducers} from 'redux';
import bugsReducer from './bugs';
import projectsReducer from './project'
import usersReducer from './users';

export default combineReducers({
    bugs: bugsReducer,
    projects: projectsReducer,
    users: usersReducer
})