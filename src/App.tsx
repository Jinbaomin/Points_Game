import { useEffect, useRef, useState } from 'react'

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
  const [pointTarget, setPointTarget] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  // const [timeInPoint, setTimeInPoint] = useState<number>(200);
  const gameOverRef = useRef<boolean>(false);

  useEffect(() => {
    if (status === Status.GAME_OVER) {
      gameOverRef.current = true;
    }
  }, [status]);

  useEffect(() => {
    let interval: any;
    if (isRunning && !isFinished) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 10);
    }

    if (pointTarget - 1 === Number(amount)) {
      setTimeout(() => {
        setStatus(Status.ALL_CLEARED);
        setIsRunning(false);
        setIsFinished(true);
      }, 2000);
    }

    return () => clearInterval(interval)
  }, [isRunning, pointTarget]);

  const handleReset = () => {
    setTimer(0);
    setPointTarget(1);
    setPoints([]);
    setStatus(Status.LETS_PLAY);
    setIsRunning(false);
    setIsFinished(false);
  }

  const handleStart = () => {
    setIsRunning(true);

    for (let i = Number(amount); i >= 1; i--) {
      const x = Math.floor(Math.random() * 650) + 1;
      const y = Math.floor(Math.random() * 400) + 1;
      setPoints(points => [...points, { number: i, time: 3000, location: { x, y }, clicked: false, timer: 200, opacity: 100 }]);
    }
  }

  const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

  const handleAutoPlay = async () => {
    setIsRunning(true);
    for (let i = 1; i <= Number(amount); i++) {
      setPointTarget(pointTarget => pointTarget + 1);

      setPoints(points =>
        points.map(point =>
          point.number === i ? { ...point, clicked: true } : point
        )
      );

      for (let j = 0; j < 20; j++) {
        if (gameOverRef.current) return;
        await delay(0.1);
        // setTimeInPoint(timeInPoint => timeInPoint - 10);
        setPoints(points =>
          points.map(point =>
            point.number === i ? { ...point, timer: point.timer - 10, opacity: point.opacity - 5 } : point
          )
        );
      }

      // setTimeInPoint(200);
      setPoints(points => points.filter(point => point.number !== i));
      // setPoints(points =>
      //   points.map(point =>
      //     point.number === i ? { ...point, clicked: true } : point
      //   )
      // );

      // for (let i = 0; i < 20; i++) {
      //   await delay(0.1);
      //   setTimeInPoint(timeInPoint => timeInPoint - 10);
      // }

      // setPointTarget(pointTarget => pointTarget + 1);

      // setTimeInPoint(200);
      // setPoints(points => points.filter(point => point.number !== i));

      // await delay(1);
    }
    setIsRunning(false);
  }

  const handleClick = async (number: number) => {
    if (number === pointTarget && isRunning) {
      setPointTarget(pointTarget => pointTarget + 1);

      setPoints(points =>
        points.map(point =>
          point.number === number ? { ...point, clicked: true } : point
        )
      );

      for (let i = 0; i < 20; i++) {
        if (gameOverRef.current) return;
        await delay(0.1);
        // setTimeInPoint(timeInPoint => timeInPoint - 10);
        setPoints(points =>
          points.map(point =>
            point.number === number ? { ...point, timer: point.timer - 10, opacity: point.opacity - 5 } : point
          )
        );
      }

      // setTimeInPoint(200);
      setPoints(points => points.filter(point => point.number !== number));

    } else {
      setStatus(Status.GAME_OVER);
      setIsRunning(false);
      setIsFinished(true);
    }
  }

  return (
    <div className='px-10 py-15'>
      <p className={`text-2xl font-bold ${status === Status.ALL_CLEARED ? 'text-green-500' : status === Status.GAME_OVER ? 'text-red-500' : ''}`}>{status}</p>
      <div className='flex gap-20'>
        <div className='flex flex-col justify-between'>
          <p className='text-xl'>Points: </p>
          <p className='text-xl'>Time: </p>
          {/* <p className='text-xl'>{(timeInPoint / 100).toFixed(2)}</p> */}
        </div>
        <div className='flex flex-col justify-between'>
          <input value={amount} onChange={(e) => {
            setAmount(e.target.value)
          }} type="string" className='border-2 border-gray-300 focus:outline-none rounded-md px-1' />
          <p className='text-xl'>{(timer / 100).toFixed(1)}s</p>
        </div>
      </div>
      <div className='flex flex-row gap-5 mt-3'>
        {!isRunning && !isFinished ? <button disabled={isRunning} onClick={handleStart} className='bg-blue-500 text-white px-10 py-1 rounded-md hover:bg-blue-600 hover:cursor-pointer'>Start</button>
          :
          <>
            <button className='bg-blue-500 text-white px-10 py-1 rounded-md hover:bg-blue-600 hover:cursor-pointer' onClick={handleReset}>Restart</button>
            <button disabled={!isRunning} onClick={handleAutoPlay} className='bg-blue-500 text-white px-10 py-1 rounded-md hover:bg-blue-600 hover:cursor-pointer'>Auto Play</button>
          </>}
      </div>
      <div className='w-1/2 h-115 border-2 border-gray-300 rounded-md mt-3 relative'>
        {points.map(point => (
          <div
            onClick={() => handleClick(point.number)}
            key={point.number}
            className={`
              absolute w-13 h-13 rounded-full border border-red-500 flex items-center justify-center
              hover:cursor-pointer select-none
              flex flex-col items-center justify-center
              transition-transform duration-[3s]
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
    </div>
  )
}

export default App
