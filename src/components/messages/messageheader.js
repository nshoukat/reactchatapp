import React from 'react';
import {Header, Segment, Input, Icon} from 'semantic-ui-react';

class MessageHeader extends React.Component{

    render(){
        const {channelName, numUniqueUsers,
              handleSearchChange, searchLoading, 
              isPrivateChannel, handleStar, isChannelStarred} = this.props;
        return (
            <Segment clearing>
                {/* Channel Title */}
                <Header fluid="true" as="h2" floated="left" style={{marginBottom: 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && (
                            <Icon 
                                onClick={handleStar} 
                                name={isChannelStarred ? "star" : "star outline"}
                                color={isChannelStarred ? "yellow" : "black"} 
                            />
                            )}
                        <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                    </span>
                </Header>
                {/* Channel Search Input */}
                <Header floated="right">
                    <Input
                        loading= {searchLoading}
                        onChange={handleSearchChange}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        )
    }

}

export default MessageHeader;