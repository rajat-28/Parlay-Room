import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";

const Chatpage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const localUser = JSON.parse(localStorage.getItem("userInfo"));
      if (!localUser) {
        navigate("/");
      }
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) return null;

  return (
    <div  style={{ width: "100%"}}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain={fetchAgain}/>}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
        )}
      </Box>
    </div>
  );
};

export default Chatpage;