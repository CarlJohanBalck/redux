import { addBug, bugAdded,loadBugs, getUnresolvedBugs, resolveBug } from '../bugs'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { apiCallBegan } from '../api';
import configStore from '../configStore';

describe("bugsSlice",  () => {
    let fakeAxios;
    let store;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
        store = configStore();
    })

    const bugSlice = () => store.getState().entities.bugs;

    const createState = () => ({
        entities: {
            bugs: {
                list:[] 
            }
        }
    });

    describe("loading bugs", () => {
        describe("if the bugs exists in the cache", () => {
            it("they should be fetched from the server and put in the store", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{id: 1}]);

                await store.dispatch(loadBugs());

                expect(bugSlice().list).toHaveLength(1);

            })
        })
        describe("if the bugs don't exists in the cache", () => {
            it("they should not be fetched from the server again", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{id: 1}]);
                await store.dispatch(loadBugs())
                await store.dispatch(loadBugs())

                expect(fakeAxios.history.get.length).toBe(1);
            })
            describe("loading indicator", () => {
                it("should be true while fetching the bugs", () =>{
                    fakeAxios.onGet("/bugs").reply(() => {
                        expect(bugSlice().loading).toBe(true);
                        return [200,[{id: 1}]];
                    })

                    store.dispatch(loadBugs());

                   
                })
                it("should be false after the bugs are fetched", async () =>{
                    fakeAxios.onGet("/bugs").reply(200, [{id: 1}])

                    await store.dispatch(loadBugs())
                    expect(bugSlice().loading).toBe(false);
                   
                })
                it("should be false after the server returns an error", async () =>{
                    fakeAxios.onGet("/bugs").reply(500)

                    await store.dispatch(loadBugs())
                    expect(bugSlice().loading).toBe(false);
                   
                })
            })
        })
    })

    it("should mark the the bug as resolved if it's saved to the server", async () => {
        // AAA
        fakeAxios.onPatch("/bugs/1").reply(200, {id: 1, resolved: true})
        fakeAxios.onPost("/bugs").reply(200, {id: 1});

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugSlice().list[0].resolved).toBe(true);
    })
    it("should not mark the the bug as resolved if it's not saved to the server", async () => {
        // AAA
        fakeAxios.onPatch("/bugs/1").reply(500, {id: 1, resolved: true})
        fakeAxios.onPost("/bugs").reply(200, {id: 1});

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugSlice().list[0].resolved).not.toBe(true);
    })

    it("should add the bug to the store if it's saved on the server ", async () =>{
     
        const bug = { description: 'a'};
        const savedBug ={ ...bug, id: 1};
        fakeAxios.onPost("/bugs").reply(200, savedBug);
     

    
        await store.dispatch(addBug(bug))
        
        expect(bugSlice().list).toContainEqual(savedBug);
        
        });
    it("should not add the bug to the store if it's saved on the server ", async () =>{
     
        const bug = { description: 'a'};
        fakeAxios.onPost("/bugs").reply(500);
     

    
        await store.dispatch(addBug(bug))
        
        expect(bugSlice().list).toHaveLength(0);
        
        });    
        describe("selectors", () => {
            it("getUnresolvedBugs", () => {     
                // AAA
                const state = createState()
                state.entities.bugs.list = [
                    { id: 1, resolved: true},
                    { id: 2},
                    { id: 3},

                ];

                const result = getUnresolvedBugs(state);

                expect(result).toHaveLength(2);

            })
        })
    
    
});
