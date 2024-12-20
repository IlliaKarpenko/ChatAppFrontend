import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col, Container} from 'react-bootstrap';
import WaitingRoom from './components/waitingroom';
import ChatRoom from './components/ChatRoom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { use, useState } from "react";

function App() {
  const[conn, setConnecton] = useState();
  const[messages, setMessages] = useState([]);
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const joinChatRoom = async (username, chatroom) => {
    try {
      // initialize a connection
      const conn = new HubConnectionBuilder()
          .withUrl("${apiBaseUrl}/chat")
          .configureLogging(LogLevel.Information)
          .build();

      // set up a handler
      conn.on("ReceiveSpecificMessage", (username, msg) => {
        setMessages(messages => [...messages, {username, msg}]);
      })

      conn.on("ReceiveMessage", (username, msg) => {
        setMessages(messages => [...messages, { username, msg }]);
        console.log("msg: ", msg);
      });

      await conn.start();
      await conn.invoke("JoinSpecificChatRoom", {username, chatroom});
      setConnecton(conn);
    } catch(e) {
      console.log(e);
    }
  }

  const sendMessage = async(message) => {
    try {
      await conn.invoke("SendMessage", message);
    } catch(e) {
        console.log(e);
    }
  }


  return (
    <div>
      <main>
        <Container>
          <Row class='px-5 my-5'>
            <Col sm='12'>
              <h1 className='font-weight-light'>Welcome to the realtime chat app</h1>
            </Col>
          </Row>
          {! conn 
            ? <WaitingRoom joinChatRoom={joinChatRoom}></WaitingRoom>
            : <ChatRoom messages={messages} sendMessage={sendMessage}></ChatRoom>
          }
        </Container>
      </main>
    </div>
  );
}

export default App;
