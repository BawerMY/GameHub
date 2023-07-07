import io from "socket.io-client"
import { useState, useEffect, useInsertionEffect } from "react"

let username
let game_id
const socket = io.connect("http://localhost:8000/")



function Tris(props) {
    const [game, setGame] = useState()
    const turn = ["x", "o", "draw"]
    const [winner, setWinner] = useState(null)

    useEffect(() => {
        socket.emit("get_game", props.id)
    }, [])

    useEffect(() => {
            socket.on("game", (data) => setGame(data))

            socket.on("win", (data) => {
                // belki bura bi cizgi cekmesini soyle
                setWinner(data)
            })

            socket.on("draw", () => setWinner(2))
    }, [socket])

    function move(r, c) {
       let myTurn = false
        for(let i = 0; i < game.players.length; i++) {
            if(game.players[i].id === socket.id) myTurn = true
        }
        if(myTurn) {
            socket.emit("move", [r, c])
        }
    }

    return (
        <div className="flex h-[75vh] max-h-[75vw] flex-col">
            {game && game.game.board.map((row, row_i) =>
            <div key={row_i} className="flex flex-row">
                {row.map((item, col_i) =>
                <div key={col_i} onClick={() => move(row_i, col_i)} className={`h-[calc(75vh/3)] flex items-center justify-center max-h-[calc(75vw/3)] aspect-square border-black border-2 ${row_i == 0 && 'border-t-0'} ${row_i == 2 && 'border-b-0'} ${col_i == 0 && 'border-l-0'} ${col_i == 2 && 'border-r-0'}`}>
                    {item !== 0 && (item == "x" ? <img width='75%' src="/images/X.svg" alt="X" /> : <img width='75%' src="/images/O.svg" alt="O" />)}
                </div>)}
            </div>)}
        </div>
    )
}


function Chess(game) {
    return (
        <div>chess</div>
    )
}




function App() {
    const [page, setPage] = useState(<Username />)
    return (page)

    function Username() {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="bg-[#323437] p-4 text-white max-sm:p-2 max-md:w-[90%] w-[640px] rounded-md outline max-sm outline-offset-4 max-sm:outline-offset-2 outline-[#e2b714] outline-4 max-sm:outline-2 flex gap-4 max-sm:gap-2">
                    <input placeholder="Userame" className="bg-[#1f2022] w-full rounded-md px-4 max-sm:px-2 h-20 max-sm:h-10 focus:outline-none text-[40px] max-sm:text-[20px]" type="text" name="" id="input" />
                    <button onClick={() => {
                        if(document.getElementById("input").value.length > 0) {
                            username = document.getElementById("input").value
                            socket.emit("set_username", username)
                            setPage(<Home playing={false} />)
                        }
                    }} className="px-8 max-sm:px-4 text-[32px] max-sm:text-base py-4 max-sm:py-2 bg-[#e2b714] rounded-md focus:outline-none">OK</button>
                </div>
            </div>
        )
    }

    function Home({ playing }) {
        const [popup, setPopup] = useState(playing !== false ? <QuickPlay playing={playing} /> : false)

        function QuickPlay({ playing }) {
            const [gameColors, setGameColors] = useState(false)

            useEffect(() => {
                if(playing !== false) socket.emit("quick_play", playing)
                setGameColors(socket.emit("get_game_colors"))
            }, [])

            useEffect(() => {
                socket.on("game_colors", (data) => setGameColors(data))

                socket.on("waiting_for_players", (data) => {console.log("wait"); setPopup(<WaitingForPlayers data={data} />)})

                socket.on("game_started", (data) => setPage(<Game id={data.id} game={data.game} />))
            }, [socket])

            function WaitingForPlayers({ data }) {
                return (//to do good
                    <div onClick={() => setPopup(false)} className="fixed flex items-center justify-center w-screen h-screen top-0 left-0 bg-[#00000080]">
                        <div onClick={(e) => e.stopPropagation()} className="text-center p-8 text-white bg-green-600 rounded-md">
                            <div className="text-[40px] max-sm:text-[20px] font-bold">Waiting for players</div>
                            <div className="text-[32px] max-sm:text-[16px] font-bold">{data.connectedPlayers} / {data.tot}</div>
                        </div>
                    </div>
                )
            }

            return (//ipad resolution responsivity error
                <div onClick={() => setPopup(false)} className="fixed flex items-center justify-center w-screen h-screen top-0 left-0 bg-[#00000080]">
                    <div className="flex flex-wrap max-xl:w-[85%] w-[60%]">
                        {gameColors && Object.keys(gameColors).map((game) =>
                        <div key={game} className="xl:w-1/3 w-1/2 xl:p-8 p-4">
                            <div onClick={() => socket.emit("quick_play", game)} className={`bg-${gameColors[game] ? "green" : "red"}-600 rounded-[32px] w-full`} style={{aspectRatio: "1 / 1.19"}}>
                                <div className="bg-gray-800 rounded-[32px] items-center justify-center w-full aspect-square">{game}</div>
                            </div>
                        </div>
                        )}

                    </div>
                </div>
            )
        }

        function PrivateGame() {
            return (
                <div onClick={() => setPopup(false)} className="fixed flex items-center justify-center w-screen h-screen top-0 left-0 bg-[#00000080]">
                    <div onClick={(e) => e.stopPropagation()} className="max-xl:w-[85%] w-[60%] h-[60%] bg-blue-800">
                        
                    </div>
                </div>
            )
        }

        return (
            <>
                <header className="h-[15%] bg-[#D9D9D9] flex items-center justify-center">
                    <h1 className="max-[480px]:text-[32px] max-[560px]:text-[36px] max-sm:text-[40px] max-md:text-[44px] max-lg:text-[48px] max-xl:text-[52px] max-2xl:text-[56px] text-[60px]">Bawer's GameHub</h1>
                </header>
                <div className="flex max-xl:flex-col max-xl:justify-end max-xl:gap-[10vw] max-xl:pb-[10vw] h-[85%] items-center justify-evenly">
                    <button onClick={() => setPopup(<QuickPlay playing={false} />)} className="bg-red-600 text-white rounded-2xl max-xl:w-[80%] max-xl:h-[15%] w-[33%] h-[15%] max-[480px]:text-[32px] max-[560px]:text-[36px] max-sm:text-[40px] max-md:text-[44px] max-lg:text-[48px] max-xl:text-[52px] max-2xl:text-[56px] text-[60px]">Quick Play</button>
                    <button onClick={() => setPopup(<PrivateGame />)} className="bg-red-600 text-white rounded-2xl max-xl:w-[80%] max-xl:h-[15%] w-[33%] h-[15%] max-[480px]:text-[32px] max-[560px]:text-[36px] max-sm:text-[40px] max-md:text-[44px] max-lg:text-[48px] max-xl:text-[52px] max-2xl:text-[56px] text-[60px]">Private Game</button>
                </div>
                {popup}
            </>
        )
    }

    function Game(props) {
        const [game, setGame] = useState(false)
        const [winner, setWinner] = useState(false)

        const gameSymbols = {
            tris: {
                me: <>{game && [<img width='100%' src="/images/X.svg" alt="X" />, <img width='32px' src="/images/O.svg" alt="O" />, ][function() {
                    for(let i = 0; i < game.players.length; i++) {
                        if(game.players[i].id === socket.id) return i
                    }
                   } ()]}</>,
                opponent: <>{game && [<img width='100%' src="/images/X.svg" alt="X" />, <img width='32px' src="/images/O.svg" alt="O" />][function() {
                    for(let i = 0; i < game.players.length; i++) {
                        if(game.players[i].id !== socket.id) return i
                    }
                   } ()]}</>
            }
        }

        useEffect(() => {
            socket.on('game', (data) => setGame(data))

            socket.on('win', (data) => setWinner(data))

            socket.on("game_ended", (data) => {alert("opponent disconnected from the game"); setPage(<Home playing={false} />)})
        }, [socket])
        game_id = props.id
        const games = {
            tris: <Tris id={props.id} />
        }


        return (
            <div className="flex flex-col h-full justify-between items-center">
                <div className="w-[640px] max-w-[90%] h-[7.5%] bg-green-950 rounded-b-3xl flex items-center justify-between px-8">
                    <div className="w-8 h-8 flex items-center justify-center">
                        {game && gameSymbols[game.game.name].opponent}
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                    {game && function() {
                    for(let i = 0; i < game.players.length; i++) {
                        if(game.players[i].id !== socket.id) return game.players[i].username
                    }
                    } ()}
                    </h1>
                    <div className="w-8 h-8 flex items-center justify-center"></div>
                </div>
                {winner ?
                <div className="fixed flex items-center justify-center w-screen h-screen top-0 left-0 bg-[#00000080]">
                <div className={`text-center p-8 text-white bg-${
                    function() {
                        let me
                        for(let i = 0; i < game.players.length; i++) {
                            if(game.players[i].id === socket.id) me = i
                        }
                        return winner.winner === me ? "green" : "red"
                    } ()
                }-600 rounded-md`}>
                    <div className="text-[40px] max-sm:text-[20px] font-bold">
                    {
                        function() {
                            let me
                            for(let i = 0; i < game.players.length; i++) {
                                if(game.players[i].id === socket.id) me = i
                            }
                            return winner.winner === me ? "Victory" : "Defeat"
                        } ()
                    }
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => {
                            socket.emit("delete_game", game.id)
                            setPage(<Home playing={game.game.name} />)
                        }}>Replay</button>
                        <button onClick={() => {
                            socket.emit("delete_game", game.id)
                            setPage(<Home playing={false} />)
                    }}>Main Menu</button>
                    </div>
                </div>
            </div>
                :
                <div className="h-[80%] w-[95%] flex items-center justify-center">
                   {games[props.game]}
                </div>}
                <div className="w-[640px] max-w-[90%] h-[7.5%] bg-green-950 rounded-t-3xl flex items-center justify-between px-8 max-xl:px-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                        {game && gameSymbols[game.game.name].me}
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                    {username}
                    </h1>
                    <div className="w-8 h-8 flex items-center justify-center"></div>
                </div>
            </div>
        )
    }

    // function Game(game) {//Maybe do this: waiting on game page like chess.com
    //     function PlayerBar() {
    //         return (
    //                 <div className="h-[10%] bg-blue-300">
    //                     <div className="rounded-xl w-16 aspect-square bg-green-500"></div>
    //                 </div>
    //         )
    //     }

    //     useEffect(() => {
    //         socket.emit()
    //     }, [])

    //     useEffect(() => {

    //     }, [socket])

    //     return (
    //         <div className="flex flex-col w-full h-full">
    //             <PlayerBar id={"121"} />
    //             <PlayerBar username={username} />
    //         </div>
    //     )
    // }
    


    // function GamesList() {
    //     const [publicGames, setPublicGames] = useState([])
    //     useEffect(() => {
    //         socket.emit("get_public_games")
    //     }, [])

        
    //     useEffect(() => {
    //         socket.on("public_games", (data) => {
    //             setPublicGames(data)
    //             console.log(data)
    //         })

    //         socket.on("game_joined", (id) => {
    //             setPage(<GameHub id={id} />)
    //         })
    //     }, [socket])

    //     return (
    //         <div>
    //             {publicGames.map(game => <div onClick={() => socket.emit("join_game", game.id)} key={game.id}>{game.id} | {game.game.name} | {game.host_id}</div>)}

    //             <input className="border-black border-2" type="text" id="game_id" />
    //             <button onClick={() => socket.emit("join_game", document.getElementById('game_id').value)}>JOIN</button>
    //         </div>
    //     )
    // }

    // function CreateGame() {
    //     useEffect(() => {
    //         socket.on("game_created", (data) => {
    //             setPage(<GameHub id={data.id} />)
    //         })
    //     }, [socket])
    //     return (
    //         <div>
    //             Create Game
    //             <select name="" id="game">
    //                 <option value="tris">Tris</option>
    //                 <option value="chess">Chess</option>
    //             </select>
    //             private: <input type="checkbox" id="private" />
    //             <button onClick={() => socket.emit("create_game", {private: document.getElementById("private").checked, game: document.getElementById("game").value})}>Create Game</button>
    //         </div>
    //     )
    // }


    // function GameHub(props) {
    //     function startGame(game) {
    //         switch (game.game.name) {
    //             case "tris": return <Tris id={game.id} />
    //         }
    //     }

    //     let [game, setGame] = useState(null)
    //     useEffect(() => {
    //         setGame(socket.emit("get_game", props.id))
    //     }, [])

    //     useEffect(() => {
    //         socket.on("game", (data) => {
    //             setGame(data)
    //         })

    //         socket.on("game_started", (game) => {
    //             setPage(startGame(game))
    //         })
    //     }, [socket])
    //     return (
    //         <div>{game && socket.id === game.host_id && <button onClick={() => {socket.emit("start_game", game.id)}}>Start</button>}
    //             {game && `${game.id} ${game.players}`}</div>
    //     )
    // }

}

export default App;
