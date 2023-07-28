const express = require('express')
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
})

games = {
    tris: class {
        constructor() {
            this.name = "tris"
            this.playersNumber = 2
            this.turn = 0
            this.board = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
            this.move = function (game, move, user_id) {
                if(this.board[move[0]][move[1]] != 0) return false
                if(game.players[this.turn].id != user_id) return false
                this.board[move[0]][move[1]] = ["x", "o"][this.turn]
                if(this.win() !== false) return {winner: this.turn, tris: this.win()}
                if(this.draw()) return {winner: false}
                this.turn+=1
                if(this.turn === game.players.length) this.turn = 0
                return true
            }
            this.win = function () {
                let symbol = ["x", "o"][this.turn]
                let totRow, totCol, totD1, totD2 = 0
                for(let i = 0; i < this.board.length; i++) {
                    totRow = 0
                    totCol = 0
                    totD1 = 0
                    totD2 = 0
                    for(let j = 0; j < this.board[i].length; j++) {
                        if(this.board[i][j] == symbol) totRow+=1
                        if(this.board[j][i] == symbol) totCol+=1
                        if(this.board[j][j] == symbol) totD1+=1
                        if(this.board[j][2-j] == symbol) totD2+=1
                    }
    
                    if(totRow === 3) return {winner: this.turn, type: "row", pos: i}
                    if(totCol === 3) return {winner: this.turn, type: "col", pos: i}
                    if(totD1 === 3) return {winner: this.turn, type: "d1"}
                    if(totD2 === 3) return {winner: this.turn, type: "d2"}
                }
                return false
            }
            this.draw = function () {
                for(let i = 0; i < this.board.length; i++) {
                    for(let j = 0; j < this.board[i].length; j++) {
                        if(this.board[i][j] == 0) return false
                    }
                }
                return true
            }
        }
    },
    chess: class {
        constructor() {
            this.name = "chess"
            this.playersNumber = 2
            this.turn = 0
            this.board = [
                ["br", "bh", "bb", "bq", "bk", "bb", "bh", "br"],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                ["wr", "wh", "wb", "wq", "wk", "wb", "wh", "wr"],
            ]
            this.getMoves = function(data) {
                let board = JSON.parse(JSON.stringify(this.board))
        
                let moves = [
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ],
                    [false, false, false, false, false, false, false, false, ]
                ]

                function get_vertical() {
                    for(let temp = data.i; temp < 8; temp++) {
                        if(board[temp][data.j] === 0) moves[temp][data.j]
                        else {
                            moves[temp][data.j] = true
                            break
                        }
                    }
                    for(let temp = data.i; temp > -1; temp--) {
                        console.log(temp)
                        if(board[temp][data.j] === 0) moves[temp][data.j] = true
                        else {
                            moves[data.i-temp][data.j] = true
                            break
                        }
                    }
                }

                function get_horizontal() {
                    for(let temp = data.j; temp < 8; temp++) {
                        if(board[data.i][temp] === 0) moves[data.i][temp] = true
                        else {
                            moves[data.i][temp] = true
                            break
                        }
                    }
                    for(let temp = data.i; temp > -1; temp--) {
                        if(board[data.i][temp] === 0) moves[data.i][temp] = true
                        else {
                            moves[data.i][temp] = true
                            break
                        }
                    }
                }

                if(board[data.i][data.j][1] === 'r') {
                    get_vertical()
                    get_horizontal()
                }
                return moves
            }
            this.move = function (game, move, user_id) {
                if(this.board[move[0]][move[1]] != 0) return false
                if(game.players[this.turn].id != user_id) return false
                // func
            }
            this.win = function () {
                // func
            }
            this.draw = function () {
                // func
            }
        }
    },
    connect4: class {
        constructor() {
            this.name = "connect4"
            this.playersNumber = 2
            this.turn = 0
            this.board = [
                [0, 0, 0, 0, 0, 0, 0, ],
                [0, 0, 0, 0, 0, 0, 0, ],
                [0, 0, 0, 0, 0, 0, 0, ],
                [0, 0, 0, 0, 0, 0, 0, ],
                [0, 0, 0, 0, 0, 0, 0, ],
                [0, 0, 0, 0, 0, 0, 0, ],
            ]

            this.move = function (game, move, user_id) {
                if(this.board[0][move] != 0) return false
                if(game.players[this.turn].id != user_id) return false
                let temp
                for(let i = 0; i < this.board.length; i++) {
                    if(this.board[i+1] === undefined || this.board[i+1][move] !== 0) {
                        temp = i
                        break
                    }
                }
                this.board[temp][move] = ["yellow", "red"][this.turn]
                if(this.win(temp, move) !== false) return(this.win(temp, move))
                if(this.draw()) return {winner: false}
                this.turn+=1
                if(this.turn === game.players.length) this.turn = 0
                return true
            }
            this.win = function (i, j) {
                let color = ["yellow", "red"][this.turn]
                let counter = 0
                for(let temp = 0; temp < 6; temp++) {
                    if(this.board[temp][j] === color) counter+=1
                    if(counter > 3) return {winner: this.turn}
                    if(this.board[temp][j] !== color) counter = 0
                }
                counter = 0
                if(counter > 3) return {winner: this.turn}
                for(let temp = 0; temp < 7; temp++) {
                    if(this.board[i][temp] === color) counter+=1
                    if(counter > 3) return {winner: this.turn}
                    if(this.board[i][temp] !== color) counter = 0
                }
                counter = 0

                try {
                    if(this.board[i-1][j+1] === color && this.board[i-2][j+2] === color && this.board[i-3][j+3] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i+1][j+1] === color && this.board[i+2][j+2] === color && this.board[i+3][j+3] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i+1][j-1] === color && this.board[i+2][j-2] === color && this.board[i+3][j-3] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i-1][j-1] === color && this.board[i-2][j-2] === color && this.board[i-3][j-3] === color) return {winner: this.turn}
                } catch {}
                
                try {
                    if(this.board[i+1][j-1] === color && this.board[i-1][j+1] === color && this.board[i-2][j+2] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i-1][j-1] === color && this.board[i+1][j+1] === color && this.board[i+2][j+2] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i-1][j+1] === color && this.board[i+1][j-1] === color && this.board[i+2][j-2] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i+1][j+1] === color && this.board[i-1][j-1] === color && this.board[i-2][j-2] === color) return {winner: this.turn}
                } catch {}
                
                try {
                    if(this.board[i+2][j-2] === color && this.board[i+1][j-1] === color && this.board[i-1][j+1] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i-2][j-2] === color && this.board[i-1][j-1] === color && this.board[i+1][j+1] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i-2][j+2] === color && this.board[i-1][j+1] === color && this.board[i+1][j-1] === color) return {winner: this.turn}
                } catch {}
                try {
                    if(this.board[i+2][j+2] === color && this.board[i+1][j+1] === color && this.board[i-1][j-1] === color) return {winner: this.turn}
                } catch {}

                return false
            }
            this.draw = function () {
                for(let i = 0; i < 6; i++) {
                    for(let j = 0; j < 7; i++) {
                        if(this.board[i][j] === 0) return false
                    }
                }
                return true
            }
        }
    }
}

db = {
    games: {},
    users: {}
}


id = -1
function generateId() {
    id++
    return id
}

// function getUsersGamesId(id) {
//     for(let game in db.games) {
//         if(db.games[game].host_id === id) return Number(db.games[game].id)
//     }
//     return false
// }

function getUsersPlyaingGamesId(id) {
    for(let game in db.games) {
       for(let i = 0; i < db.games[game].players.length; i++) {
           if(db.games[game].players[i].id === id) return Number(game)
       }
    }
    return false
}

function createGame(data, host) {
    let game = {
        id: generateId(),
        host_id: host.id,
        private: data.private,
        game: new games[data.game],
        started: false,
        players: [host]
        
    }
    db.games[game.id] = game
    console.log("Game created: " + game.id)
    return game
}

function deleteGame(id) {
    delete db.games[id]
    console.log("Game deleted: " + id)
    // index = Object.keys(db.games).indexOf(id)
    // newGames = {}
    // db.games = db.games.
    // console.log("Game deleted: " + id)
}

// function getPublicGames() {
//     public_games = []
//     for(let game in db.games) {
//             if(!db.games[game].private && !db.games[game].started) public_games.push(db.games[game])
//         }
//     return public_games
// }



function getGameColors() {
    let games = {
        tris: false,
        // chess: false,
        connect4: false,
    }

    for(let game in db.games) {
        if(!db.games[game].private && !db.games[game].started) games[db.games[game].game.name] = true
    }

    return games
}



io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // socket.on("get_public_games", () => {
    //     socket.join("public_games")
    //     socket.emit("public_games", getPublicGames())
    // })

    // socket.on("create_game", (data) => {
    //     if(getUsersGamesId(socket.id) !== false) {
    //         temp = db.games[getUsersGamesId(socket.id)].private
    //         deleteGame(getUsersGamesId(socket.id))
    //     }
    //     let game = createGame(data, socket.id)
    //     socket.join(getUsersGamesId(socket.id))
    //     socket.emit("game_created", game)
    //     if(data.private === false || !temp) socket.to("public_games").emit("public_games", getPublicGames())
    //     temp = undefined
    // })

    socket.on("delete_game", (id) => {
        try {//fix a lot of thinks replay etc
            if(getUsersPlyaingGamesId(socket.id) === id) {
                deleteGame(id)
                if(!db.games[id].private) socket.to("get_public_games").emit("public_games", getPublicGames())
            }
        }
        catch {}
    })

    // socket.on('join_game', (id) => {
    //     socket.join(id)
    //     db.games[id].players.push(socket.id)
    //     socket.emit("game_joined", id)
    //     socket.to(id).emit("game", db.games[id])
    //     console.log(`User ${socket.id} joined ${id}`)
    // })

    // socket.on('start_game', (id) => {
    //     if(socket.id === db.games[id].host_id) {
    //         db.games[id].started = true
    //         socket.to(id).emit("game_started", db.games[id])
    //         socket.emit("game_started", db.games[id])
    //         socket.to("public_games").emit("public_games", getPublicGames())
    //         console.log(`User ${socket.id} started ${id}`)
    //     }
    // })

    socket.on('set_username', (username) => db.users[socket.id] = username)

    socket.on("quick_play", (game) => {
        temp = false
        for(let id in db.games) {
            if(!db.games[id].private && !db.games[id].started && db.games[id].game.name === game) temp = Number(id)
        }
        if(temp !== false) {
            for(let i = 0; i < db.games[id].players.length; i++) {
                if(db.games[id].players[i].id === socket.id) return
            }
        }
        if(temp !== false) {
            db.games[temp].players.push({id: socket.id, username: db.users[socket.id]})
            socket.join(temp)
            socket.leave("get_game_colors")
            if(db.games[temp].players.length === db.games[temp].game.playersNumber) {
                socket.emit("game_started", {id: temp, game: db.games[temp].game.name})
                db.games[temp].started = true
                socket.to(temp).emit("game_started", {id: temp, game: db.games[temp].game.name})
            }
            else {
                socket.emit("waiting_for_players", { connectedPlayers: db.games[temp].players.length, tot: db.games[temp].game.playersNumber })
                socket.to(temp).emit("waiting_for_players", { connectedPlayers: db.games[temp].players.length, tot: db.games[temp].game.playersNumber })
            }
        }
        else {
            temp = createGame({ private: false, game: game }, {id: socket.id, username: db.users[socket.id]})
            socket.join(temp.id)
            socket.leave("get_game_colors")
            socket.emit("waiting_for_players", { connectedPlayers: temp.players.length, tot: temp.game.playersNumber })
            socket.to(temp.id).emit("waiting_for_players", { connectedPlayers: temp.players.length, tot: temp.game.playersNumber })
        }
        socket.to("get_game_colors").emit("game_colors", getGameColors())
    })

    socket.on('get_game_colors', () => {
        socket.join("get_game_colors")
        socket.emit("game_colors", getGameColors())
    })

    socket.on('get_game', (id) => {
        socket.emit("game", db.games[id])
        console.log(`Game ${id} sent to ${socket.id}`)
    })

    socket.on("move", (data) => {
        m = db.games[getUsersPlyaingGamesId(socket.id)].game.move(db.games[getUsersPlyaingGamesId(socket.id)], data, socket.id)
        if(m !== false) {
            socket.emit("game", db.games[getUsersPlyaingGamesId(socket.id)])
            socket.to(getUsersPlyaingGamesId(socket.id)).emit("game", db.games[getUsersPlyaingGamesId(socket.id)])
            if(typeof m === "object") {
                if(m.winner === false) socket.emit("draw")
                else {
                    socket.emit("win", m)
                    socket.to(getUsersPlyaingGamesId(socket.id)).emit("win", m)
                }
            }
        }
    })

    socket.on('leave_game', () => {
        let upg = getUsersPlyaingGamesId(socket.id)
        socket.leave(upg)
        for(let i = 0; i < db.games[upg].players.length; i++) {
            if(db.games[upg].players[i].id === socket.id) delete db.games[upg].players[i]
        }
        socket.to(upg).emit("waiting_for_players", { connectedPlayers: db.games[upg].players.length, tot: db.games[upg].game.playersNumber })
    })

    socket.on('get_moves', (data) => {
        let game = db.games[getUsersPlyaingGamesId(socket.id)]
        if((function() {
            for(let i = 0; i < game.players.length; i++) {
                if(game.players[i].id === socket.id) return i
            }
        } ()) !== game.game.turn) return false
        
        moves = game.game.getMoves(data)
        socket.emit('moves', moves)
    })

    socket.on("create_private_game", (game) => {
        let temp = createGame({ private: true, game: game }, {id: socket.id, username: db.users[socket.id]})
        socket.join(temp.id)
        socket.emit("waiting_for_players", { connectedPlayers: temp.players.length, tot: temp.game.playersNumber, id: temp.id })
        socket.to(temp.id).emit("waiting_for_players", { connectedPlayers: temp.players.length, tot: temp.game.playersNumber, id: temp.id })
    })

    socket.on("join_private_game", (id) => {
        db.games[id].players.push({id: socket.id, username: db.users[socket.id]})
            socket.join(id)
            socket.leave("get_game_colors")
            if(db.games[id].players.length === db.games[id].game.playersNumber) {
                socket.emit("game_started", {id: id, game: db.games[id].game.name})
                db.games[id].started = true
                socket.to(id).emit("game_started", {id: id, game: db.games[id].game.name})
            }
            else {
                socket.emit("waiting_for_players", { connectedPlayers: db.games[id].players.length, tot: db.games[id].game.playersNumber, id: temp.id })
                socket.to(id).emit("waiting_for_players", { connectedPlayers: db.games[id].players.length, tot: db.games[id].game.playersNumber, id: temp.id })
            }
    })



//dissconnect during the game handle
    socket.on('disconnect', () => {
        if(getUsersPlyaingGamesId(socket.id) !== false) {
            temp = db.games[getUsersPlyaingGamesId(socket.id)].private
            socket.to(getUsersPlyaingGamesId(socket.id)).emit("game_ended", {detail: "opponent leaved the game"})
            deleteGame(getUsersPlyaingGamesId(socket.id))
            // if(!temp) socket.to("public_games").emit("public_games", getPublicGames())
        }
        console.log(`User disconnected: ${socket.id}`)
    })
})





server.listen(8000, () => console.log("SERVER IS RUNNING"))