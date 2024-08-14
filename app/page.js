'use client'
import { Box, Stack, Button, TextField, Typography } from '@mui/material'
import Image from "next/image";
import { useState, useRef, useEffect } from 'react'
import "./globals.css";


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm a CineWave Support Agent, are you looking for a show, movie or song?`,
    },
  ])

  const [message, setMessage] = useState('')

  const chatEndRef = useRef(null)

  const sendMessage = async () => {
    if (message.trim() === '') return;
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(processText)
      })
    })
    setMessage('')
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Prevent page scroll
    return () => {
      document.body.style.overflow = ''; // Reset overflow on unmount
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };


  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <Typography
        key={index}
        variant="body1"
        sx={{
          mb: 0,
          pb: 0,
        }}
      >
        {line}
      </Typography>
    ));
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      p={3}
      sx={{
        backgroundImage: `url('https://media.istockphoto.com/id/1319521847/photo/luxury-private-home-cinema-room.jpg?s=2048x2048&w=is&k=20&c=5BrxiEZfw5RGsiHeVB8q4SYfT97VlNJgUZAnYqQmYuY=')`, // Replace with your background image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',

      }}
    >
      {/* Header */}
      <Box
        width="100%"
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mb={4}
      >
        <Box
          sx={{
            backgroundImage: `url('https://images.creativefabrica.com/products/previews/2023/10/28/ywh7VBZFr/2XNuFlMGYsVfokD3fjj3sKaKwCf-mobile.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
          }}
        />
        <Typography
          variant="h5"
          ml={1}
          sx={{
            color: 'white',
            textTransform: 'uppercase'
          }}
        >
          CineWave.ai
        </Typography>
      </Box>

      {/* Main Content */}
      <Stack
        direction="row"
        width="100%"
        height="calc(100vh - 100px)"
        spacing={3}
        flexGrow={1}
      >
        {/* Left Side (Image Area) */}
        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius={4}
          p={2}
        >
          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius={4}
            p={2}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius={4}
              p={2}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '1rem',
              }}
            >
              <Typography
                variant="body1"
                align="center"
                sx={{
                  fontStyle: 'italic',
                  color: 'white',
                  fontSize: '3.0rem',
                  fontFamily: 'Tangerine, cursive',

                }}
              >
                Discover your next favorite song, show, or movie with personalized recommendations tailored to your unique tastes and preferences.
              </Typography>
            </Box>

          </Box>
        </Box>


        {/* Right Side (Chat Area) */}
        <Stack
          direction="column"
          flex={2}
          border="1px solid black"
          borderRadius={4}
          p={2}
          spacing={3}
          bgcolor="rgba(0, 0, 0)"
          sx={{
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}

        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={message.role === 'assistant'
                    ? 'rgba(0, 127, 255, 0.8)'
                    : 'rgba(255, 0, 255, 0.8)'}
                  color="white"
                  borderRadius={16}
                  p={3}
                  maxWidth="80%"
                >
                  {formatText(message.content)}
                </Box>

              </Box>
            ))}
            <div ref={chatEndRef} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Enter a message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              InputProps={{
                style: {
                  color: 'white',
                },
              }}
              InputLabelProps={{
                style: {
                  color: 'white',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                backgroundColor: 'hotpink',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'deeppink',
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}