import { useEffect, useRef, useState } from 'react'
import Modal from './components/Modal'

interface Location {
  x: number;
  y: number;
}

enum Status {
  LETS_PLAY = "LET'S PLAY",
  ALL_CLEARED = "ALL CLEARED",
  GAME_OVER = "GAME OVER"
}

interface Point {
  number: number;
  time: number;
  location: Location;
  clicked: boolean;
  timer: number;
  opacity: number;
}

function App() {
  const [timer, setTimer] = useState(0)
  const [amount, setAmount] = useState('5')
  const [points, setPoints] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<Status>(Status.LETS_PLAY);
  const [isFinished, setIsFinished] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const gameOverRef = useRef<boolean>(false);
  const versionRef = useRef<number>(0);
  const isAutoPlayRef = useRef<boolean>(false);
  const pointTarget = useRef<number>(1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === Status.GAME_OVER)
      gameOverRef.current = true;
  }, [status]);

  useEffect(() => {
    let interval: any, timeout: any;
    if (isRunning && !isFinished) {
      interval = setInterval(() => {
        setTimer(timer => timer + 10);
      }, 100);
    }

    if (pointTarget.current - 1 === Number(amount)) {
      timeout = setTimeout(() => {
        setStatus(Status.ALL_CLEARED);
        setIsRunning(false);
        setIsFinished(true);
        setShowWinModal(true);
      }, 2000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    }
  }, [isRunning, pointTarget.current]);

  // const handleReset = () => {
  //   setTimer(0);
  //   pointTarget.current = 1;
  //   setPoints([]);
  //   setStatus(Status.LETS_PLAY);
  //   setIsRunning(false);
  //   setIsFinished(false);
  //   setShowWinModal(false);
  //   setShowLoseModal(false);
  //   gameOverRef.current = false;
  //   handleStart();
  // }

  const handleStart = () => {
    // Clear all state
    versionRef.current = versionRef.current + 1;
    setTimer(0);
    setPoints([]);
    pointTarget.current = 1;
    setStatus(Status.LETS_PLAY);
    setIsRunning(false);
    setIsFinished(false);
    setShowWinModal(false);
    setShowLoseModal(false);
    setIsRunning(true);
    isAutoPlayRef.current = false;
    gameOverRef.current = false;

    const pointSize = 60;
    const boxWidth = boxRef.current?.clientWidth || 650;
    const boxHeight = boxRef.current?.clientHeight || 400;

    for (let i = Number(amount); i >= 1; i--) {
      const x = Math.floor(Math.random() * (boxWidth - pointSize)) +1;
      const y = Math.floor(Math.random() * (boxHeight - pointSize)) + 1;
      setPoints(points => [...points, { number: i, time: 3000, location: { x, y }, clicked: false, timer: 200, opacity: 100 }]);
    }
  }

  const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

  const handleAutoPlay = async (version: number) => {
    setIsRunning(true);
    isAutoPlayRef.current = !isAutoPlayRef.current;
    // versionRef.current += 1;

    const interval = setInterval(() => {
      handleClick(pointTarget.current, version, true, isAutoPlayRef.current);
      if(pointTarget.current > Number(amount) || !isAutoPlayRef.current) clearInterval(interval);
    }, 1000);
  }

  const handleClick = async (number: number, version: number, isAutoPlay: boolean = false, isAutoPlayRef: boolean = false) => {
    if (number === pointTarget.current && isRunning) {

      if(isAutoPlay && !isAutoPlayRef) return;

      // setPointTarget(pointTarget => pointTarget + 1);
      pointTarget.current += 1;

      setPoints(points =>
        points.map(point =>
          point.number === number ? { ...point, clicked: true } : point
        )
      );

      for (let i = 0; i < 20; i++) {
        if (gameOverRef.current) return;
        await delay(0.1);
        setPoints(points =>
          points.map(point =>
            point.number === number ? { ...point, timer: point.timer - 10, opacity: point.opacity - 5 } : point
          )
        );
      }

      if (version === versionRef.current) {
        setPoints(points => points.filter(point => point.number !== number));
      }

    } else {
      setStatus(Status.GAME_OVER);
      setIsRunning(false);
      setIsFinished(true);
      setShowLoseModal(true);
    }
  }

  return (
    <div className='px-10 py-15'>
      {/* Title */}
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>🎯 Points Game</h1>
        <p className='text-gray-600'>Click the points in numerical order!</p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200'>
        <p className={`text-2xl font-bold text-center ${status === Status.ALL_CLEARED ? 'text-green-500' : status === Status.GAME_OVER ? 'text-red-500' : 'text-blue-600'}`}>{status}</p>
      </div>
      
      <div className='bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200'>
        <div className='flex gap-20'>
          <div className='flex flex-col gap-2 justify-between'>
            <p className='text-xl font-medium text-gray-700'>Points: </p>
            <p className='text-xl font-medium text-gray-700'>Time: </p>
            {/* <p className='text-xl'>{pointTarget.current}</p> */}
            {/* <p className='text-xl'>{points.map(point => point.number).join(', ')}</p> */}
          </div>
          <div className='flex flex-col gap-2 justify-between'>
            <input value={amount} onChange={(e) => {
              setAmount(e.target.value)
            }} type="string" className='border-2 border-gray-300 focus:border-blue-500 focus:outline-none rounded-md px-3 py-1 shadow-sm' />
            <p className='text-xl font-bold text-blue-600'>{(timer / 100).toFixed(1)}s</p>
          </div>
        </div>
      </div>
      <div className='flex flex-row gap-5 mt-3'>
        {!isRunning && !isFinished ? (
          <button 
            disabled={isRunning} 
            onClick={handleStart} 
            className='bg-blue-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            🚀 Start Game
          </button>
        ) : (
          <>
            <button 
              onClick={handleStart} 
              className='bg-green-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg'
            >
              🔄 Restart
            </button>
            {!isFinished && (
              <button 
                disabled={!isRunning} 
                onClick={() => handleAutoPlay(versionRef.current)} 
                className={`px-8 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isAutoPlayRef.current 
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {!isAutoPlayRef.current ? 'Auto Play ON' : 'Auto Play OFF'}
              </button>
            )}
          </>
        )}
      </div>
      <div ref={boxRef} className='w-1/2 h-115 border-4 border-gray-300 rounded-xl mt-3 relative bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg mx-auto'>
        {points.map(point => (
          <div
            onClick={() => handleClick(point.number, versionRef.current)}
            key={point.number}
            className={`
              absolute w-13 h-13 rounded-full border-2 border-orange-500 flex items-center justify-center
              hover:cursor-pointer select-none
              flex flex-col items-center justify-center
              transition-transform duration-[3s]
              shadow-md
              ${point.clicked ? `bg-orange-500 text-white border-orange-500` : 'bg-white'}
            `}
            style={{
              top: `${point.location.y}px`,
              left: `${point.location.x}px`,
              opacity: point.clicked ? point.opacity / 100 : 1
            }}
          >
            <p className={`text-xl ${point.clicked ? 'text-white' : ''}`}>{point.number}</p>
            <p className={`text-sm ${point.clicked ? 'text-white' : 'hidden'}`}>{(point.timer / 100).toFixed(2)}s</p>
          </div>
        ))}
      </div>

      {/* Win Modal */}
      <Modal 
        isOpen={showWinModal} 
        onClose={() => setShowWinModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">You Won!</h3>
          <p className="text-gray-600 mb-4">
            You successfully cleared all {amount} points in {(timer / 100).toFixed(1)} seconds!
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleStart}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200"
            >
              Play Again
            </button>
            <button 
              onClick={() => setShowWinModal(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Lose Modal */}
      <Modal 
        isOpen={showLoseModal} 
        onClose={() => setShowLoseModal(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center p-6">
          <div className="text-6xl mb-4">💀</div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">You Lost!</h3>
          <p className="text-gray-600 mb-4">
            You clicked the wrong point. Try again!
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleStart}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200"
            >
              Try Again
            </button>
            <button 
              onClick={() => setShowLoseModal(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default App
