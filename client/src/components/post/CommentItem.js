import React from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { deleteComment } from '../../actions/post';
import Moment from 'react-moment';
import { PropTypes } from 'prop-types';

const CommentItem = ({ postId, comment: { _id, avatar, text, name, date, user }, auth, deleteComment }) => {
    console.log(_id, avatar, text, name, date, user);
    return (

        <div className="post bg-white p-1 my-1">
            <div>
                <Link to={`/profile/${user}`}>
                    <img
                        className="round-img"
                        src={avatar}
                        alt=""
                    />
                    <h4>{name}</h4>
                </Link>
            </div>
            <div>
                <p className="my-1">
                    {text}
                </p>
                <p className="post-date">
                    Posted on<Moment format="YYYY/MM/DD">{date}</Moment>
                </p>
                {!auth.loading && user === auth.user._id && (
                    <button className="btn btn-danger" type="button" onClick={e => deleteComment(postId, _id)}><i className="fas fa-times"></i></button>
                )}
            </div>
        </div>
    )
}

CommentItem.propTypes = {
    auth: PropTypes.object.isRequired,
    postId: PropTypes.string.isRequired,
    comment: PropTypes.object.isRequired,
    deleteComment: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, { deleteComment })(CommentItem);