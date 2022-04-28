import React from 'react'
import ReactDOM from 'react-dom'
import KeyboardEventHandler from 'react';
import './index.css'


class Score extends React.Component{
    render(){
        return(
            <p className='score'>Score: {this.props.value}</p>
        )
    }
}


class Cell extends React.Component{
    render(){
        const type = this.props.type
        const className = 'game-cell ' + type
        return(
            
            <div className={className}>
             </div>
        )
    }
}

class Field extends React.Component{
    render(){
        const head = this.props.head;
        const food = this.props.food;
        const tailes = this.props.tailes;
        const columns = [];
        for (let y=0; y<15; y++){
            let row = []
            for (let x=0; x<15; x++){
                row.push(<Cell type='empty' />)
            }
            columns.push(row)
        }
        
        tailes.forEach(tail => {
            columns[tail.y][tail.x] = <Cell type='tail' />
        });

        columns[food.y][food.x] = <Cell type='food' />
        columns[head.y][head.x] = <Cell type='head' />
        
        
        const result = columns.map(element => {
            return (
            <div className='row'>
                {element}
            </div>
        )})
        return (
            <div className='field'>
                {result}
            </div>
        )
    }
}


class Key extends React.Component{
    render(){
        return (
            <button onClick={this.props.onClick} className='keyboard-key'>
                {this.props.direction}
            </button>
        )
    }
}


class Keyboard extends React.Component{
    handleClick(direction){
        this.props.handleClick(direction)
    }

    render(){
        return(
            <div className='keyboard'>
            <div className='keyboard-row keyboard-up'>
            <Key direction='up' onClick={() => this.handleClick('up')} />
            </div>
            <div className='keyboard-row keyboard-up'>
            <Key direction='left' onClick={() => this.handleClick('left')} />
            <Key direction='right' onClick={() => this.handleClick('right')} /> 
            <div className='keyboard-row keyboard-up'>
            <Key direction='down' onClick={() => this.handleClick('down')} />
            </div>
            </div>
            </div>
        )
        }
}

class LoseKeyboard extends React.Component{
    handleClick(){
        this.props.handleClick()
    }

    render(){
        return(
            <button className='kayboard-key' onClick={() => this.handleClick()}>
                restart
            </button>
        )
        }
}

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            score: 0,
            head: {x: 7, y: 7},
            direction: {x: 0, y: 0},
            food: generateFood([]),
            tailes: [{x: 7, y: 7}],
            isRunning: true,
        }
        this.handleClick = this.handleClick.bind(this)
        this.handleScore = this.handleScore.bind(this)
        this.restart = this.restart.bind(this)
    }

    restart(){
        this.setState({
            score: 0,
            head: {x: 7, y: 7},
            direction: {x: 0, y: 0},
            food: generateFood([]),
            tailes: [{x: 7, y: 7}],
            isRunning: true,
        })

        this.componentDidMount()
    }

    handleClick(direction){
        const directions = {
            'up': {x: 0, y: -1},
            'down': {x: 0, y: 1,},
            'right': {x: 1, y: 0,},
            'left': {x: -1, y: 0}
        }
        const newDirection = directions[direction]
        const oldDirection = this.state.direction
        const isNotMoving = oldDirection.x == 0 && oldDirection.y == 0
        if (!isNotMoving && (oldDirection.x == newDirection.x || oldDirection.y == newDirection.y)){
            return
        }

        this.setState({
            direction: newDirection
        })
    }

    handleScore(){
        const score = this.state.score;
        const tailes = this.state.tailes;
        const lastTaleIndex = tailes.length - 1
        this.setState({
            score: score+1,
            food: generateFood(tailes),
            tailes: tailes.concat([{
                x: tailes[lastTaleIndex].x, 
                y: tailes[lastTaleIndex].y,
            }])
        })


    }
    
    moveHead(){
        let head = this.state.head
        const food = this.state.food
        const direction = this.state.direction
        const tailes = this.state.tailes.slice().reverse()

        tailes.forEach((element, index, array) => {
            if (index != array.length-1){
            array[index].x = array[index+1].x;
            array[index].y = array[index+1].y;
        }})
        
        tailes.reverse()
        head = {
            x: head.x + direction.x,
            y: head.y + direction.y}
        tailes[0] = head

        tailes.slice(1).forEach(element => {
            if (isFaced(element, head)){
                clearInterval(this.timerID);
                this.setState(
                    {isRunning: false}
                )
                return 
            }
        })
        
        if (head.x > 14){
            head.x = 0
        }
        if (head.x < 0){
            head.x = 14
        }
        if (head.y < 0){
            head.y = 14
        }
        if (head.y > 14){
            head.y = 0
        }


        this.setState({
            head: head,
            tailes: tailes
        })
        
        if (isFaced(head, food)){
            this.handleScore()
        }
        return 
    }

    componentDidMount(){
        this.timerID = setInterval(
            () => this.moveHead(),
            150
        );
        
        const keys = {
            ArrowLeft: 'left',
            ArrowDown: 'down',
            ArrowUp: 'up',
            ArrowRight: 'right'
        }

        document.addEventListener('keydown', (event) => {
            let key = event.code
            if (key in keys){
                this.handleClick(keys[key])
            }
        })
    }

    componentWillUnmount(){
        clearInterval(this.timerID)
    }

    render(){
        const head = this.state.head
        const food = this.state.food
        const score = this.state.score

        const tailes = this.state.tailes
        const keyboard = this.state.isRunning ? <Keyboard handleClick={this.handleClick} /> : <LoseKeyboard handleClick={this.restart} />
        return (         
            <div className='app'>
                <Score value={score} />
                <Field head={head} food={food} tailes={tailes.slice(1)}/>
                {keyboard}

            </div>);
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function isFaced(pointOne, pointTwo){
    return pointOne.x == pointTwo.x && pointOne.y == pointTwo.y
}

function generateFood(tailes){
    const tailesX = []
    const tailesY = []
    tailes.forEach((element) => {
        tailesX.push(element.x)
        tailesY.push(element.y)
    })

    let result = {x: getRndInteger(0, 14), y: getRndInteger(0, 14)}
    while (tailesX.includes(result.x) && tailesY.includes(result.y)){
        result = {x: getRndInteger(0, 14), y: getRndInteger(0, 14)}
    }
    return result
}