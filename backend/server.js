const express = require('express')
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const { copyFileSync } = require('fs')

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
    
                    if(totRow === 3) return {winner:this.turn, type: "row", pos: i}
                    if(totCol === 3) return {winner:this.turn, type: "col", pos: i}
                    if(totD1 === 3) return {winner:this.turn, type: "d1"}
                    if(totD2 === 3) return {winner:this.turn, type: "d2"}
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

function getUsersGamesId(id) {
    for(let game in db.games) {
        if(db.games[game].host_id === id) return Number(db.games[game].id)
    }
    return false
}

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

function getPublicGames() {
    public_games = []
    for(let game in db.games) {
            if(!db.games[game].private && !db.games[game].started) public_games.push(db.games[game])
        }
    return public_games
}



function getGameColors() {
    let games = {
        tris: false,
        chess: false
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

    socket.on('set_username', (username) => {db.users[socket.id] = username})

    socket.on("quick_play", (game) => {
        temp = false
        for(let id in db.games) {
            if(!db.games[id].private && !db.games[id].started && db.games[id].game.name === game) temp = Number(id)
        }
        if(temp !== false) {for(let i = 0; i < db.games[id].players.length; i++) {
            if(db.games[id].players[i].id === socket.id) return
        }}
        if(temp !== false) {
            db.games[temp].players.push({id: socket.id, username: db.users[socket.id]})
            socket.join(temp)
            socket.leave("get_game_colors")
            if(db.games[temp].players.length === db.games[temp].game.playersNumber) {
                socket.emit("game_started", {id: temp, game: db.games[temp].game.name})
                db.games[temp].started = true
                socket.to(temp).emit("game_started", {id: temp, game: db.games[temp].game.name})
                console.log(JSON.stringify(db.games[temp]))
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



//dissconnect during the game handle
    socket.on('disconnect', () => {
        if(getUsersPlyaingGamesId(socket.id) !== false) {
            temp = db.games[getUsersPlyaingGamesId(socket.id)].private
            socket.to(getUsersPlyaingGamesId(socket.id)).emit("game_ended", {detail: "opponent leaved the game"})
            deleteGame(getUsersPlyaingGamesId(socket.id))
            if(!temp) socket.to("public_games").emit("public_games", getPublicGames())
        }
        console.log(`User disconnected: ${socket.id}`)
    })
})





















server.listen(8000, () => console.log("SERVER IS RUNNING"))