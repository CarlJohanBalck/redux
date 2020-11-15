import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import axios from 'axios';
import { apiCallBegan } from './api';
import moment from 'moment'

const slice = createSlice({
    name: "bugs",
    initialState: {
        list: [],
        loading: false,
        lastFetch: null,
    },
    reducers: {

        bugsRequested: (bugs, action) => {
            bugs.loading = true;
        },
        //bugs/bugsReceied
        bugsReceived: (bugs, action) =>{
            bugs.list = action.payload;
            bugs.loading = false;
            bugs.lastFetch = Date.now();
        },

        bugsRequestFailed: (bugs, action) => {
            bugs.loading = false
        },
        // actions => action handlers
        bugAssignedToUser: (bugs, action) => {
            console.log("BUGS ASSIGNED TO USER: ", action)
            const { id: bugId, userId } = action.payload;
            const index = bugs.list.findIndex(bug => bug.id === bugId)
            bugs.list[index].userId = userId;
        },
        // command - event
        // addBug - bugAdded
        bugAdded: (bugs, action) => {
            bugs.list.push(action.payload);
        },
        bugRemoved: (bugs, action) =>{
            bugs.filter(bug => bug.id !== action.payload.id);
        },

        // resolveBug (command) - bugResolved (event)
        bugResolved: (bugs, action) => {
            const index = bugs.list.findIndex(bug => bug.id === action.payload.id)
            bugs.list[index].resolved = true;
        }
    },

     
    
})


export const {
    bugAdded, //addBug
    bugResolved, //
    bugAssignedToUser,
    bugsReceived,
    bugsRequested, 
    bugsRequestFailed
} = slice.actions;
export default slice.reducer;

//Action Creator
const url = "/bugs";

// () => fn(dispatch, getState)
export const loadBugs = () => (dispatch, getState) => {
    const {lastFetch} = getState().entities.bugs;

    console.log(lastFetch)

    const diffInMinutes = moment().diff(moment(lastFetch), 'minutes');
    if(diffInMinutes < 10) return;

    return dispatch(
        apiCallBegan({
        url,
        onStart: bugsRequested.type,
        onSuccess: bugsReceived.type,
        onError: bugsRequestFailed.type
        })
    );
}

// make an api call
// promise resolved => dispatch(success)
// export const addBug = bug => {
//     try{
//         const response = await axios.post(url, bug);
//         dispatch(bugAdded(bug));
//     } catch(error) {
//         dispatch({type: 'error'});
//     }
    
// }



export const addBug = bug => 
    apiCallBegan({
        url, 
        method: "post",
        data: bug,
        onSuccess: bugAdded.type
    })

export const resolveBug = id => apiCallBegan({
    // /bugs
    // PATCH /bugs/1
    url:  url + '/' + id,
    method: 'patch',
    data: {resolved: true},
    onSuccess: bugResolved.type

})

export const assignBugToUser = (bugId, userId) => apiCallBegan({
    url: url + '/' + bugId,
    method: 'patch',
    data: {userId},
    onSuccess: bugAssignedToUser
})



// Memoization
// bugs => get unresolved bugs from the cache
export const getUnresolvedBugs = createSelector(
    state => state.entities.bugs,
    state => state.entities.projects,
    (bugs, projects) => bugs.list.filter(bug => !bug.resolved)
);

// state => unresolvedBugs


export const getBugsByUser = userId => createSelector(
    state => state.entities.bugs,
    bugs => bugs.filter(bug => bug.userId === userId)
)



