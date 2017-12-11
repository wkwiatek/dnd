import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const moveToOtherList = (list1, list2, sourceIndex, destinationIndex) => {
    const resultList1 = [...list1];
    const resultList2 = [...list2];
    const [removed] = resultList1.splice(sourceIndex, 1);
    resultList2.splice(destinationIndex, 0, removed);

    return [resultList1, resultList2];
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lists: [
                {id: 1, title: 'Accounts', items: [{id: 3, content: 'a'}, {id: 4, content: 'b'}]},
                {id: 2, title: 'Cards', items: [{id: 5, content: 'c'}, {id: 6, content: 'd'}]}
            ]
        };
    }

    onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        let lists;

        if (result.type === 'LIST_ITEM') {
            const sourceDroppableIndex = parseInt(result.source.droppableId, 10);
            const destinationDroppableIndex = parseInt(result.destination.droppableId, 10);

            // same list
            if (sourceDroppableIndex === destinationDroppableIndex) {
                lists = this.state.lists.map((list, index) => {
                    return sourceDroppableIndex === index ? {
                        ...list,
                        items: reorder(
                            this.state.lists[sourceDroppableIndex].items,
                            result.source.index,
                            result.destination.index
                        )
                    } : list;
                });
            } else {
                const [sourceModifiedList, destinationModifiedList] = moveToOtherList(
                    this.state.lists[sourceDroppableIndex].items,
                    this.state.lists[destinationDroppableIndex].items,
                    result.source.index,
                    result.destination.index
                );

                lists = this.state.lists.map((list, index) => {
                    return {
                        ...list,
                        items: index === sourceDroppableIndex
                            ? sourceModifiedList
                            : index === destinationDroppableIndex
                                ? destinationModifiedList
                                : list.items
                    }

                });
            }
        } else {
            lists = reorder(
                this.state.lists,
                result.source.index,
                result.destination.index
            );
        }


        this.setState({
            lists
        });
    };

    addList = (title) => {
        this.setState((state) => ({
            lists: [...state.lists, {id: Math.random(), title, items: []}]
        }));
    };

    removeList = (listId) => {
        this.setState((state) => ({
            lists: state.lists.filter(l => l.id !== listId)
        }));
    };

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <button onClick={() => this.addList(this.addInput.value)}>Add new list</button>
                <input ref={(input) => this.addInput = input}/>
                <Droppable
                    droppableId="droppable"
                    type="GROUP"
                >
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                        >
                            {this.state.lists.map((list, mapIndex) => (
                                <Draggable
                                    key={list.id}
                                    draggableId={`${list.id}`}
                                    type="GROUP"
                                >
                                    {(provided, snapshot) => (
                                        <div>
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.dragHandleProps}
                                                style={{padding: '5px 5px 5px 20px', border: '1px solid black'}}
                                            >
                                                <h3>{list.title}</h3>
                                                <button onClick={() => this.removeList(list.id)}>Remove list</button>
                                                <Droppable
                                                    droppableId={`${mapIndex}`}
                                                    type="LIST_ITEM"
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            style={{minHeight: 20}}
                                                        >
                                                            <div>
                                                                {list.items.map(item => (
                                                                    <Draggable
                                                                        key={item.id}
                                                                        draggableId={item.id}
                                                                        type="LIST_ITEM"
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <div>
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.dragHandleProps}
                                                                                    style={{
                                                                                        padding: 5,
                                                                                        border: '1px solid black'
                                                                                    }}
                                                                                >
                                                                                    {item.content}
                                                                                </div>
                                                                                {provided.placeholder}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}
