import React, { useState, useEffect } from "react";
import {
  Divider,
  Typography,
  Grid,
  Avatar,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Link
} from "@material-ui/core";
import "./styles.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import apiUrl from "../../../systemVariable.js";


function UserPhotos(props) {
  let navigate = useNavigate();
  const userid = useParams().userId;
  //-----------fetch API-------------------
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [data, setData] = useState([]);
  const [user, setUser] = useState([]);
  const[photoId,setPhotoId] = useState([]);
  const [newComment, setNewComment] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, photoData] = await Promise.all([
          fetchUserData(),
          fetchPhotoData(),
        ]);
        setUser(userData);
        setData(photoData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching the data.");
      }
    };
    fetchData();
  }, [ props.photoIsUploaded,newComment, userid]);

  //User fetch
  const fetchUserData = async () => {
    const response = await fetch(
      `${apiUrl.api}/api/user/${userid}`,
      { credentials: "include", withCredentials: true },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };
  //end user fetch

  //photo fetch
  const fetchPhotoData = async () => {
    const response = await fetch(
      `${apiUrl.api}/api/photo/photosOfUser/${userid}`,
      { credentials: "include" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };
  //end photo fetch


  // function event

  //submit comment
  const handleCommentSubmit = () => {
    const txtCmt = comment;
    setComment("");
    setOpen(false);
    axios
      .post(
        `${apiUrl.api}/api/photo/commentsOfPhoto/${photoId}`,
        { cmt: txtCmt, photo_id: photoId },
        { credentials: "include", withCredentials: true },
      )
      .then((response) => {
        console.log("add comment success!!");
        setNewComment(response.data);
      })
      .catch((err) => console.log("Comment Sent Failure: ", err));
  };


  //open dialog comment
  const handleClickOpen = (photoid) => {
    setPhotoId(photoid)
    setOpen(true);
  };

  //close dialog comment
  const handleClickClose = () => {
    setPhotoId(null);
    setOpen(false);
  };
  //fortmart
  const formartDateTime = (s) => {
    const date = new Date(s);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  const curUser = user[0];

  // giao dien

  if (curUser && data.length > 0 && props.loginUser) {
    {console.log("tesst data", data[0].comments)}
    return (
      <Grid container justifyContent="flex-start" >
        {data.map((photo) => (
          <Grid item xs={10}>
            {/* post layout  */}
            <Card style={{ borderRadius: "14px", border: "2px solid #444444", margin:'10px' }}>
              <CardHeader
                title={
                  <Typography>{`${curUser.first_name} ${curUser.last_name}`}</Typography>
                }
                subheader={formartDateTime(photo.date_time)}
              />
              {/* postContent  */}

              {/* img */}
              <CardMedia
                style={{ objectFit: "contain", width: '100%', height:'auto' }}
                component="img"
                image={photo.file_name}
                alt=""
              />

              {/* Comment layout */}
              <CardContent style={{ paddingTop: "0" }}>
                {photo.comments && (
                  <Typography
                    variant="subtitle1"
                    style={{ marginBottom: "5px" }}
                  >
                    Comments:
                    <Divider />
                  </Typography>
                )}
                {photo.comments.length>0 && (photo.comments.map((c) => (
                  <div key={photo._id} style={{ marginBottom: "10px" }}>
                    {c.user &&(<Link
                      onClick={() => navigate(`/users/${c.user._id}`)}
                      variant="subtitle2"
                      style={{ marginRight: "5px",  cursor: 'pointer' }}
                    >
                      (<b style={{ fontSize: "14px" }}>
                        {`${c.user.first_name} ${c.user.last_name}`}
                      </b>)
                    </Link> )}
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      gutterBottom
                    >
                      <b>{formartDateTime(c.date_time)}</b>
                    </Typography>

                    <Typography variant="body1">
                      {`"${c.comment}"`}
                      <Divider />
                    </Typography>
                  </div>
                )))}
                {/* new comment */}

                <div className="comment-dialog">
                  <Chip
                    label="Bình luận"
                    onClick={()=>handleClickOpen(photo._id)}
                    style={{
                      backgroundColor: "#abd1c6",
                      border: "1px solid black",
                    }}
                  />
                </div>

                <Dialog open={open} onClose={handleClickClose}>
                  <DialogContent>
                    <DialogContentText>Bình luận</DialogContentText>
                    <TextField
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      autoFocus
                      multiline
                      margin="dense"
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClickClose}>Hủy</Button>
                    <Button
                      onClick={(e) => handleCommentSubmit()}
                      style={{
                        backgroundColor: "#79CFF5",
                        border: "1px solid black",
                      }}
                    >
                      Bình luận
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
}
export default UserPhotos;
