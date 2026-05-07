/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Monitor, Cpu, 
  ArrowLeft, Star, Award, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  Edit3, Link2, Zap, BarChart, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { questionBank } from './data/questions';
import { VisualElement } from './components/VisualElement';
import { sounds } from './utils/audio';

const matchColors = [
  'bg-pink-100 border-pink-400 text-pink-800',
  'bg-cyan-100 border-cyan-400 text-cyan-800',
  'bg-lime-100 border-lime-400 text-lime-800',
  'bg-amber-100 border-amber-400 text-amber-800',
  'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-800'
];

const subjectsInfo = {
  tinhoc: { title: "Tin Học", icon: <Monitor size={32} />, color: "bg-blue-500", shadow: "shadow-blue-500/50" },
  congnghe: { title: "Công Nghệ", icon: <Cpu size={32} />, color: "bg-orange-500", shadow: "shadow-orange-500/50" }
};

const screenVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const questionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [activeMatchLeft, setActiveMatchLeft] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const goHome = () => {
    setCurrentScreen('home');
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedDifficulty(null);
  };

  const goToSubjects = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentScreen('subjects');
  };

  const goToDifficulty = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentScreen('difficulty');
  };

  const startQuiz = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    if (selectedGrade && selectedSubject && (questionBank as any)[selectedGrade]) {
      let rawQuestions = [...(questionBank as any)[selectedGrade][selectedSubject]];
      
      // Shuffle questions
      rawQuestions.sort(() => Math.random() - 0.5);
      
      // Select count based on difficulty
      let count = 30;
      if (difficulty === 'easy') count = 10;
      if (difficulty === 'medium') count = 20;
      
      setQuestions(rawQuestions.slice(0, count));
    }
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setActiveMatchLeft(null);
    setShowFeedback(false);
    setCurrentScreen('quiz');
  };

  const checkAnswer = (index: number, answerOverride?: any) => {
    const q = questions[index];
    const answer = answerOverride !== undefined ? answerOverride : userAnswers[index];
    if (!q || answer === undefined) return false;

    const qType = q.type || "mcq";
    let isCorrect = false;

    if (qType === "mcq" || qType === "tf") {
      isCorrect = answer === q.correct;
    } else if (qType === "text") {
      isCorrect = answer?.toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase();
    } else if (qType === "match") {
      isCorrect = true;
      const correctKeys = Object.keys(q.correct);
      if (!answer || Object.keys(answer).length !== correctKeys.length) {
        isCorrect = false;
      } else {
        for (const key in q.correct) {
          if (answer[key] !== q.correct[key]) {
            isCorrect = false;
            break;
          }
        }
      }
    }
    return isCorrect;
  };

  const handleAnswer = (answerValue: any) => {
    if (showFeedback && (questions[currentQuestionIndex].type === 'mcq' || questions[currentQuestionIndex].type === 'tf')) return;

    const newAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: answerValue
    };
    setUserAnswers(newAnswers);

    // Immediate feedback for MCQ and TF
    const qType = questions[currentQuestionIndex].type || "mcq";
    if (qType === "mcq" || qType === "tf") {
      const isCorrect = checkAnswer(currentQuestionIndex, answerValue);
      if (isCorrect) sounds.playCorrect();
      else sounds.playIncorrect();
      setShowFeedback(true);
    }
  };

  const handleMatchRightClick = (rightIdx: number) => {
    if (activeMatchLeft !== null) {
      const currentAnswerObj = userAnswers[currentQuestionIndex] || {};
      const newMatch = { ...currentAnswerObj };
      
      Object.keys(newMatch).forEach(key => {
        if (newMatch[key as unknown as number] === rightIdx) delete newMatch[key as unknown as number];
      });
      
      newMatch[activeMatchLeft] = rightIdx;
      handleAnswer(newMatch);
      setActiveMatchLeft(null);
    }
  };

  const handleNext = () => {
    if (!showFeedback) {
      const isCorrect = checkAnswer(currentQuestionIndex);
      if (isCorrect) sounds.playCorrect();
      else sounds.playIncorrect();
      setShowFeedback(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setActiveMatchLeft(null);
      setShowFeedback(false);
    } else {
      setCurrentScreen('result');
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      const qType = q.type || "mcq";
      const answer = userAnswers[index];
      
      if (answer === undefined) return;

      if (qType === "mcq" || qType === "tf") {
        if (answer === q.correct) score++;
      } else if (qType === "text") {
        if (answer.toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase()) {
          score++;
        }
      } else if (qType === "match") {
        let isCorrect = true;
        const correctKeys = Object.keys(q.correct);
        const answerKeys = Object.keys(answer);
        
        if (correctKeys.length !== answerKeys.length) {
          isCorrect = false;
        } else {
          for (const key in q.correct) {
            if (answer[key] !== q.correct[key]) {
              isCorrect = false;
              break;
            }
          }
        }
        if (isCorrect) score++;
      }
    });
    return score;
  };

  const renderHome = () => (
    <motion.div 
      key="home"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={screenVariants}
      className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-4"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 drop-shadow-md">
          Vui Học Thi Học Kì 2 🚀
        </h1>
        <p className="text-lg text-indigo-600 font-medium">Em học lớp mấy nhỉ? Chọn khối lớp của em nhé!</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4"
      >
        {[3, 4, 5].map((grade) => (
          <motion.button
            variants={itemVariants}
            id={`grade-${grade}`}
            key={grade}
            onClick={() => goToSubjects(grade)}
            whileHover={{ scale: 1.02, translateY: -8 }}
            className="group relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 border-b-8 border-indigo-200 hover:border-indigo-400"
          >
            <div className="absolute top-4 right-4 text-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity">
              <Star size={32} fill="currentColor" />
            </div>
            <h2 className="text-4xl font-black text-indigo-700 mb-2">Lớp {grade}</h2>
            <p className="text-indigo-500 font-medium">Ôn tập kiến thức</p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderSubjects = () => (
    <motion.div 
      key="subjects"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={screenVariants}
      className="flex flex-col items-center min-h-[80vh] pt-10 px-4"
    >
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <button 
          id="back-btn"
          onClick={goHome}
          className="flex items-center text-indigo-700 hover:text-indigo-900 bg-white/50 px-4 py-2 rounded-full font-bold transition-colors"
        >
          <ArrowLeft className="mr-2" /> Quay lại
        </button>
        <h2 className="text-3xl font-extrabold text-indigo-800 bg-white/50 px-6 py-2 rounded-full">
          Khối Lớp {selectedGrade}
        </h2>
      </div>

      <h3 className="text-2xl font-bold text-center text-indigo-800 mb-8">Hôm nay em muốn ôn môn gì?</h3>

      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl"
      >
        {Object.entries(subjectsInfo).map(([key, subject]) => (
          <motion.button
            variants={itemVariants}
            id={`subject-${key}`}
            key={key}
            onClick={() => goToDifficulty(key)}
            whileHover={{ scale: 1.02, translateY: -8 }}
            className={`${subject.color} text-white rounded-3xl p-8 shadow-lg hover:${subject.shadow} transition-all duration-300 flex flex-col items-center justify-center space-y-4`}
          >
            <div className="bg-white/20 p-4 rounded-full">
              {subject.icon}
            </div>
            <span className="text-3xl font-bold">{subject.title}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderDifficulty = () => (
    <motion.div 
      key="difficulty"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={screenVariants}
      className="flex flex-col items-center min-h-[80vh] pt-10 px-4"
    >
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <button 
          id="back-to-subjects"
          onClick={() => setCurrentScreen('subjects')}
          className="flex items-center text-indigo-700 hover:text-indigo-900 bg-white/50 px-4 py-2 rounded-full font-bold transition-colors"
        >
          <ArrowLeft className="mr-2" /> Quay lại
        </button>
        <h2 className="text-3xl font-extrabold text-indigo-800 bg-white/50 px-6 py-2 rounded-full">
          {subjectsInfo[selectedSubject as keyof typeof subjectsInfo].title}
        </h2>
      </div>

      <h3 className="text-2xl font-bold text-center text-indigo-800 mb-8">Thử thách nào dành cho em?</h3>

      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
      >
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03, translateY: -8 }}
          onClick={() => startQuiz('easy')}
          className="bg-green-500 text-white rounded-3xl p-8 shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex flex-col items-center space-y-4"
        >
          <div className="bg-white/20 p-4 rounded-full"><Zap size={32} /></div>
          <span className="text-2xl font-bold">Dễ</span>
          <p className="text-center text-green-100 opacity-90">10 câu hỏi ngẫu nhiên</p>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03, translateY: -8 }}
          onClick={() => startQuiz('medium')}
          className="bg-yellow-500 text-white rounded-3xl p-8 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 flex flex-col items-center space-y-4"
        >
          <div className="bg-white/20 p-4 rounded-full"><BarChart size={32} /></div>
          <span className="text-2xl font-bold">Trung bình</span>
          <p className="text-center text-yellow-100 opacity-90">20 câu hỏi ngẫu nhiên</p>
        </motion.button>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03, translateY: -8 }}
          onClick={() => startQuiz('hard')}
          className="bg-red-500 text-white rounded-3xl p-8 shadow-lg hover:shadow-red-500/50 transition-all duration-300 flex flex-col items-center space-y-4"
        >
          <div className="bg-white/20 p-4 rounded-full"><Trophy size={32} /></div>
          <span className="text-2xl font-bold">Khó</span>
          <p className="text-center text-red-100 opacity-90">Tất cả (30 câu hỏi)</p>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderQuiz = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    const qType = question.type || "mcq";
    const currentAnswer = userAnswers[currentQuestionIndex];
    
    let isAnswered = false;
    if (qType === "mcq" || qType === "tf") {
      isAnswered = currentAnswer !== undefined;
    } else if (qType === "text") {
      isAnswered = currentAnswer && currentAnswer.trim().length > 0;
    } else if (qType === "match") {
      isAnswered = currentAnswer && Object.keys(currentAnswer).length === question.leftItems.length;
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <motion.div 
        key="quiz"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={screenVariants}
        className="flex flex-col items-center min-h-[80vh] pt-6 px-4 w-full max-w-4xl mx-auto"
      >
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-4">
             <button onClick={() => goToSubjects(selectedGrade!)} className="text-indigo-600 font-bold hover:bg-indigo-100 p-2 rounded-full transition">
              <ArrowLeft />
            </button>
            <span className="text-lg font-bold text-indigo-800 bg-indigo-100 px-4 py-1 rounded-full">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-3">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white w-full rounded-3xl shadow-xl p-6 md:p-10 border-t-8 border-indigo-500 mb-8"
          >
            <div className="mb-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-200 shadow-sm">
              {qType === 'mcq' && 'Đọc kỹ và Chọn đáp án đúng nhất'}
              {qType === 'tf' && 'Phán đoán: Đúng hay Sai?'}
              {qType === 'text' && 'Điền từ thích hợp vào chỗ trống'}
              {qType === 'match' && 'Nối cột trái với cột phải tương ứng'}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
              {question.question}
            </h3>

            {question.questionVisual && (
              <div className="mb-8 py-8 bg-gray-50 border-2 border-gray-100 rounded-2xl flex justify-center items-center shadow-inner overflow-hidden relative">
                 <VisualElement type={question.questionVisual} />
              </div>
            )}

            {qType === "mcq" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt: any, idx: number) => {
                  const isSelected = currentAnswer === idx;
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const optVisual = typeof opt === 'object' && opt.visual ? opt.visual : null;
                  
                  return (
                    <motion.button
                      id={`opt-${idx}`}
                      key={idx}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      animate={showFeedback && idx === question.correct 
                        ? { 
                            scale: [1, 1.03, 1],
                            boxShadow: ["0 0 0px rgba(34, 197, 94, 0)", "0 0 20px rgba(34, 197, 94, 0.4)", "0 0 0px rgba(34, 197, 94, 0)"]
                          } 
                        : {}
                      }
                      transition={showFeedback && idx === question.correct ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                      onClick={() => handleAnswer(idx)}
                      disabled={showFeedback}
                      className={`relative p-5 rounded-2xl text-left text-lg font-semibold transition-all duration-200 border-2 flex flex-col justify-center overflow-hidden
                        ${isSelected && !showFeedback 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md ring-4 ring-indigo-100' 
                          : ''}
                        ${showFeedback && idx === question.correct 
                          ? 'border-green-500 bg-green-50 text-green-800 shadow-sm ring-4 ring-green-100' 
                          : ''}
                        ${showFeedback && isSelected && idx !== question.correct 
                          ? 'border-red-500 bg-red-50 text-red-800 shadow-sm' 
                          : ''}
                        ${!isSelected && (!showFeedback || idx !== question.correct)
                          ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                          : ''}
                        ${showFeedback ? 'cursor-default' : ''}
                      `}
                    >
                      {showFeedback && idx === question.correct && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm"
                        >
                          <CheckCircle2 size={16} />
                        </motion.div>
                      )}
                      {showFeedback && isSelected && idx !== question.correct && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                        >
                          <XCircle size={16} />
                        </motion.div>
                      )}
                      {!showFeedback && isSelected && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-sm"
                        >
                          <CheckCircle2 size={16} />
                        </motion.div>
                      )}
                      {optVisual && <div className="mb-4 mt-2 w-full flex justify-center"><VisualElement type={optVisual} /></div>}
                      <div className="flex items-center w-full">
                        <span className={`inline-block flex-shrink-0 w-8 h-8 text-center leading-8 border-2 rounded-full mr-3 text-sm font-bold transition-colors
                          ${showFeedback && idx === question.correct ? 'bg-green-500 border-green-500 text-white' : ''}
                          ${showFeedback && isSelected && idx !== question.correct ? 'bg-red-500 border-red-500 text-white' : ''}
                          ${!showFeedback && isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                          ${(!showFeedback && !isSelected) || (showFeedback && idx !== question.correct && !isSelected) ? 'bg-white border-gray-200 text-gray-500' : ''}
                        `}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span>{optText}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {qType === "tf" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button
                  id="tf-true"
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  animate={showFeedback && question.correct === true 
                    ? { 
                        scale: [1, 1.03, 1],
                        boxShadow: ["0 0 0px rgba(34, 197, 94, 0)", "0 0 25px rgba(34, 197, 94, 0.4)", "0 0 0px rgba(34, 197, 94, 0)"]
                      } 
                    : {}
                  }
                  transition={showFeedback && question.correct === true ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                  onClick={() => handleAnswer(true)}
                  disabled={showFeedback}
                  className={`group p-6 rounded-2xl text-2xl font-black transition-all border-4 flex items-center justify-center space-x-3
                    ${currentAnswer === true && !showFeedback ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-4 ring-green-100' : ''}
                    ${showFeedback && question.correct === true ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-4 ring-green-100' : ''}
                    ${showFeedback && currentAnswer === true && question.correct !== true ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-4 ring-red-100' : ''}
                    ${!showFeedback && currentAnswer !== true ? 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 text-gray-600' : ''}
                    ${showFeedback && currentAnswer !== true && question.correct !== true ? 'border-gray-200 bg-white text-gray-400 opacity-60' : ''}
                    ${showFeedback ? 'cursor-default' : ''}
                  `}
                >
                  <CheckCircle2 size={32} className={(currentAnswer === true || (showFeedback && question.correct === true)) ? "text-green-600" : "text-gray-400 group-hover:text-green-400 transition-colors"} />
                  <span>ĐÚNG</span>
                </motion.button>
                <motion.button
                  id="tf-false"
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  animate={showFeedback && question.correct === false 
                    ? { 
                        scale: [1, 1.03, 1],
                        boxShadow: ["0 0 0px rgba(34, 197, 94, 0)", "0 0 25px rgba(34, 197, 94, 0.4)", "0 0 0px rgba(34, 197, 94, 0)"]
                      } 
                    : {}
                  }
                  transition={showFeedback && question.correct === false ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                  onClick={() => handleAnswer(false)}
                  disabled={showFeedback}
                  className={`group p-6 rounded-2xl text-2xl font-black transition-all border-4 flex items-center justify-center space-x-3
                    ${currentAnswer === false && !showFeedback ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-4 ring-red-100' : ''}
                    ${showFeedback && question.correct === false ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-4 ring-green-100' : ''}
                    ${showFeedback && currentAnswer === false && question.correct !== false ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-4 ring-red-100' : ''}
                    ${!showFeedback && currentAnswer !== false ? 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 text-gray-600' : ''}
                    ${showFeedback && currentAnswer !== false && question.correct !== false ? 'border-gray-200 bg-white text-gray-400 opacity-60' : ''}
                    ${showFeedback ? 'cursor-default' : ''}
                  `}
                >
                  <XCircle size={32} className={(currentAnswer === false || (showFeedback && question.correct === false)) ? "text-red-600" : "text-gray-400 group-hover:text-red-400 transition-colors"} />
                  <span>SAI</span>
                </motion.button>
              </div>
            )}

            {qType === "text" && (
              <div className="flex flex-col items-center py-6 w-full">
                <motion.div 
                  animate={showFeedback 
                    ? (checkAnswer(currentQuestionIndex) 
                      ? { scale: [1, 1.05, 1], y: [0, -5, 0] } 
                      : { x: [-5, 5, -5, 5, 0] })
                    : (currentAnswer ? { scale: [1, 1.02, 1] } : {})
                  }
                  transition={{ duration: showFeedback ? 0.4 : 0.3 }}
                  className="relative w-full max-w-lg mb-4"
                >
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Edit3 className="text-indigo-400" />
                  </div>
                  <input
                    id="text-answer"
                    type="text"
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    disabled={showFeedback}
                    placeholder="Gõ câu trả lời của em vào đây..."
                    className={`w-full pl-12 pr-4 py-4 text-xl md:text-2xl font-bold text-center border-4 rounded-3xl focus:ring-4 outline-none transition-all shadow-inner 
                      ${showFeedback 
                        ? (checkAnswer(currentQuestionIndex) ? 'border-green-400 bg-green-50 text-green-900' : 'border-red-400 bg-red-50 text-red-900')
                        : 'border-indigo-200 focus:border-indigo-600 focus:ring-indigo-100 bg-indigo-50/30 text-indigo-900'
                      }`}
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isAnswered) {
                        handleNext();
                      }
                    }}
                  />
                </motion.div>
                <div className="flex flex-col items-center">
                  <p className="mb-4 text-sm text-gray-500 italic flex items-center text-center">
                    * Không cần viết hoa, hệ thống tự động nhận diện chữ!
                  </p>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm"
                    >
                      <CheckCircle2 size={20} />
                      <span>Đã ghi nhận câu trả lời!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {qType === "match" && (
              <div className="flex flex-col">
                <p className="text-gray-500 italic mb-6 text-center">💡 Hướng dẫn: Bấm chọn 1 ô bên TRÁI, sau đó bấm 1 ô bên PHẢI để nối.</p>
                <div className="flex justify-between gap-4 md:gap-8">
                  <div className="w-1/2 flex flex-col gap-3">
                    {question.leftItems.map((item: any, idx: number) => {
                      const isMatched = currentAnswer && currentAnswer[idx] !== undefined;
                      const isActive = activeMatchLeft === idx;
                      const styleClass = isMatched 
                        ? matchColors[idx % matchColors.length] 
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700';

                      return (
                        <button 
                          id={`match-left-${idx}`}
                          key={`left-${idx}`}
                          onClick={() => !showFeedback && setActiveMatchLeft(isActive ? null : idx)}
                          disabled={showFeedback}
                          className={`relative p-4 rounded-xl text-left font-bold transition-all border-2
                            ${styleClass}
                            ${isActive ? 'ring-4 ring-indigo-300 transform scale-[1.02] z-10' : ''}
                            ${showFeedback ? 'cursor-default' : ''}
                          `}
                        >
                          <span className="inline-block w-6 h-6 text-center leading-6 bg-white/50 rounded mr-2 text-sm shadow-sm">{idx + 1}</span>
                          {item}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex flex-col justify-center text-gray-300">
                    <Link2 size={32} />
                  </div>
                  <div className="w-1/2 flex flex-col gap-3">
                    {question.rightItems.map((item: any, idx: number) => {
                      const matchedLeftIndex = currentAnswer ? Object.keys(currentAnswer).find(key => currentAnswer[key as unknown as number] === idx) : undefined;
                      const isMatched = matchedLeftIndex !== undefined;
                      const styleClass = isMatched 
                        ? matchColors[parseInt(matchedLeftIndex!) % matchColors.length] 
                        : 'bg-white border-gray-200 text-gray-700';

                      return (
                        <button 
                          id={`match-right-${idx}`}
                          key={`right-${idx}`}
                          onClick={() => !showFeedback && handleMatchRightClick(idx)}
                          disabled={showFeedback}
                          className={`relative p-4 rounded-xl text-left font-bold transition-all border-2
                            ${styleClass}
                            ${activeMatchLeft !== null && !isMatched && !showFeedback ? 'hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer' : ''}
                            ${activeMatchLeft === null && !isMatched ? 'cursor-not-allowed opacity-80' : ''}
                            ${showFeedback ? 'cursor-default' : ''}
                          `}
                        >
                          {isMatched && <span className="inline-block w-6 h-6 text-center leading-6 bg-white/50 rounded mr-2 text-sm shadow-sm">{parseInt(matchedLeftIndex!) + 1}</span>}
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-6 rounded-2xl border-l-8 ${checkAnswer(currentQuestionIndex) ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
              >
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {checkAnswer(currentQuestionIndex) ? (
                      <CheckCircle2 className="text-green-600" size={32} />
                    ) : (
                      <XCircle className="text-red-600" size={32} />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold mb-1 ${checkAnswer(currentQuestionIndex) ? 'text-green-800' : 'text-red-800'}`}>
                      {checkAnswer(currentQuestionIndex) ? 'Chính xác! Giỏi lắm! 🎉' : 'Chưa đúng rồi em ơi! 😅'}
                    </h4>
                    {!checkAnswer(currentQuestionIndex) && (
                      <p className="text-red-700 font-medium mb-2">
                         Đáp án đúng là: <span className="font-bold underline">
                           {qType === 'mcq' && (typeof question.options[question.correct] === 'string' ? question.options[question.correct] : question.options[question.correct].text)}
                           {qType === 'tf' && (question.correct ? 'ĐÚNG' : 'SAI')}
                           {qType === 'text' && question.correct}
                           {qType === 'match' && 'Xem lại phần nối đúng bên dưới'}
                         </span>
                      </p>
                    )}
                    {question.explanation && (
                      <div className="mt-2 text-gray-700 italic border-t border-gray-200 pt-2">
                        <span className="font-bold text-indigo-700 not-italic">💡 Giải thích: </span>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          id="next-btn"
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex items-center px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all
            ${isAnswered 
              ? (showFeedback ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-500 hover:bg-green-600') + ' text-white hover:scale-105 hover:shadow-indigo-500/50 cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
            }`}
        >
          {!showFeedback 
            ? 'Kiểm tra' 
            : (currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp tục')}
          <ChevronRight className="ml-2" />
        </button>
      </motion.div>
    );
  };

  const renderResult = () => {
    const score = calculateScore();
    const total = questions.length;
    const isPerfect = score === total;

    return (
      <motion.div 
        key="result"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={screenVariants}
        className="flex flex-col items-center min-h-[80vh] pt-10 px-4 w-full max-w-4xl mx-auto pb-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full text-center relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-xl mb-4 border-4 border-yellow-400">
              {isPerfect ? <Award size={48} className="text-yellow-500" /> : <Star size={48} className="text-yellow-500" />}
            </div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
              {isPerfect ? "Xuất sắc! Điểm tối đa! 🎉" : "Hoàn thành bài tập! 👏"}
            </h2>
            <p className="text-xl text-gray-600 mb-8 font-medium">Em đã đúng {score} trên tổng số {total} câu.</p>
            <div className="flex justify-center space-x-4">
              <motion.button 
                id="retry-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(selectedDifficulty!)}
                className="flex items-center px-6 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-full transition-colors shadow-sm"
              >
                <RotateCcw className="mr-2" size={20} /> Làm lại
              </motion.button>
              <motion.button 
                id="home-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goHome}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all"
              >
                <BookOpen className="mr-2" size={20} /> Chọn môn khác
              </motion.button>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <h3 className="text-2xl font-bold text-indigo-900 mb-6 px-4">Xem lại bài làm của em:</h3>
          {questions.map((q, i) => {
            const userAnswer = userAnswers[i];
            const qType = q.type || "mcq";
            
            let isCorrect = false;
            if (qType === "mcq" || qType === "tf") {
              isCorrect = userAnswer === q.correct;
            } else if (qType === "text") {
              isCorrect = userAnswer && userAnswer.toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase();
            } else if (qType === "match") {
               isCorrect = true;
               for (const key in q.correct) {
                 if (!userAnswer || userAnswer[key] !== q.correct[key]) {
                   isCorrect = false;
                   break;
                 }
               }
            }

            return (
              <div key={i} className={`bg-white rounded-2xl p-6 shadow-md border-l-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex items-start">
                  <div className="mt-1 mr-4">
                    {isCorrect ? <CheckCircle2 className="text-green-500" size={28} /> : <XCircle className="text-red-500" size={28} />}
                  </div>
                  <div className="w-full overflow-hidden">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Câu {i + 1}: {q.question}</h4>
                    {q.questionVisual && (
                      <div className="mb-4 mt-2 transform scale-75 origin-left">
                        <VisualElement type={q.questionVisual} />
                      </div>
                    )}
                    {qType === "mcq" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
                        {q.options.map((opt: any, optIdx: number) => {
                          const optText = typeof opt === 'string' ? opt : opt.text;
                          let bgColor = "bg-gray-50 text-gray-600 border border-gray-200";
                          if (optIdx === q.correct) bgColor = "bg-green-100 text-green-800 border border-green-300 font-bold";
                          else if (optIdx === userAnswer && !isCorrect) bgColor = "bg-red-100 text-red-800 border border-red-300 font-bold";
                          return (
                            <div key={optIdx} className={`p-3 rounded-lg flex items-center ${bgColor}`}>
                               <span className="mr-2 font-bold">{['A', 'B', 'C', 'D'][optIdx]}.</span> {optText}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {qType === "tf" && (
                      <div className="flex flex-col space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-gray-700">
                          Câu trả lời của em: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{userAnswer === true ? 'ĐÚNG' : userAnswer === false ? 'SAI' : 'Chưa trả lời'}</span>
                        </div>
                        {!isCorrect && (
                           <div className="text-gray-700">
                             Đáp án chính xác là: <span className="font-bold text-green-600">{q.correct === true ? 'ĐÚNG' : 'SAI'}</span>
                           </div>
                        )}
                      </div>
                    )}
                    {qType === "text" && (
                      <div className="flex flex-col space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-gray-700">
                          Câu trả lời của em: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>"{userAnswer || 'Chưa trả lời'}"</span>
                        </div>
                        {!isCorrect && (
                           <div className="text-gray-700">
                             Đáp án chính xác là: <span className="font-bold text-green-600">"{q.correct}"</span>
                           </div>
                        )}
                      </div>
                    )}
                    {qType === "match" && (
                      <div className="flex flex-col space-y-3 mt-4">
                        {q.leftItems.map((leftItem: any, idx: number) => {
                          const userRightIdx = userAnswer ? userAnswer[idx] : undefined;
                          const correctRightIdx = q.correct[idx];
                          const isPairCorrect = userRightIdx === correctRightIdx;
                          return (
                            <div key={idx} className={`p-3 rounded-lg border-2 ${isPairCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                              <div className="flex items-center text-sm md:text-base">
                                <span className="font-bold text-indigo-900 w-1/2">{leftItem}</span>
                                <span className="mx-2 text-gray-400">➔</span>
                                <span className={userRightIdx !== undefined ? "text-gray-800" : "text-gray-400 italic"}>
                                  {userRightIdx !== undefined ? q.rightItems[userRightIdx] : 'Chưa nối'}
                                </span>
                              </div>
                              {!isPairCorrect && (
                                <div className="text-sm font-bold text-green-600 mt-2 pt-2 border-t border-red-100">
                                  Đáp án đúng: ➔ {q.rightItems[correctRightIdx]}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-400">
                        <p className="text-indigo-900 text-sm md:text-base">
                          <span className="font-bold mr-1">💡 Giải thích:</span>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 font-sans">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full p-4 bg-white/30 backdrop-blur-md shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center text-indigo-800 font-bold">
            <BookOpen className="mr-2 text-indigo-600" /> Ôn Tập Tiểu Học Tin Học & Công Nghệ
          </div>
        </header>

        <main className="flex-grow flex flex-col w-full overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'home' && renderHome()}
            {currentScreen === 'subjects' && renderSubjects()}
            {currentScreen === 'difficulty' && renderDifficulty()}
            {currentScreen === 'quiz' && renderQuiz()}
            {currentScreen === 'result' && renderResult()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

