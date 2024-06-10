import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = ()=>{
    const queryClient = useQueryClient();

    const {mutate: follow, isPending} = useMutation({
        mutationFn: async (userId)=>{
            try {
                const res = await fetch(`/api/users/follow/${userId}`,{
                    method: "POST",
                });

                const data = await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong");
                }

            } catch (error) {
                throw new Error(error);                
            }
        },
        onSuccess: ()=>{
        /* Promise.all array help to solve number of promises in an array together/parallel 
        means it wait for both the promises to complete then the main promise resolve*/
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),
                queryClient.invalidateQueries({queryKey: ["authUser"]}),
            ])
        },
        onError: (error) => {
			toast.error(error.message);
		},
    })

    return {follow, isPending};

};


export default useFollow;