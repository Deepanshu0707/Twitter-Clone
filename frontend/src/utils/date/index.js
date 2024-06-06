export const formatPostDate = (createdAt)=>{
    const currentDate = new Date();
    const createdAtDate = new Date(createdAt);

    const timeDiffInSeconds = Math.floor((currentDate-createdAtDate)/1000);
    const timeDiffInMinute = Math.floor(timeDiffInSeconds/60);
    const timeDiffInHour = Math.floor(timeDiffInMinute/60);
    const timeDiffInDays = Math.floor(timeDiffInHour/24);

    if(timeDiffInDays > 1){
        return createdAtDate.toLocaleDateString("en-us",{month:"short", day: "numeric"});
    } else if(timeDiffInDays === 1){
        return "1d";
    } else if(timeDiffInHour >= 1){
        return `${timeDiffInHour}h`;
    } else if(timeDiffInMinute >= 1){
        return `${timeDiffInMinute}m`;
    } else{
        return "Just now";    
    }
}

export const formatMemberSinceDate = (createdAt) => {
	const date = new Date(createdAt);
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const month = months[date.getMonth()];
	const year = date.getFullYear();
	return `Joined ${month} ${year}`;
};