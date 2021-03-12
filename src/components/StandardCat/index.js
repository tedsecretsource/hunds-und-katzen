import { useEffect, useState } from "react";

const Kitty = ({loadingUrl}) => {

    const [kitty, setKitty] = useState({});
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const maxDimension = 600;

    useEffect(() => {
        fetch('https://api.thecatapi.com/v1/images/search')
            .then(res => res.json())
            .then(
                (result) => {
                    setKitty(result[0]);
                    setIsLoaded(true);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setError(true);
                    setIsLoaded(true);
                }
            );
    },[]);

    /**
     * Set the max dimension to maxDimension
     * @param {*} kitty 
     * @returns 
     */
    const getSizedDimensions = (kitty) => {
        let dimensions = {};
        let ratio = 1;
        if(kitty.width >= kitty.height) {
            ratio = maxDimension / kitty.width;
            dimensions.width = maxDimension;
            dimensions.height = Math.round(kitty.height * ratio);
        } else {
            ratio = maxDimension / kitty.height;
            dimensions.width = Math.round(kitty.width * ratio);
            dimensions.height = maxDimension;
        }
        return dimensions;
    }

    if( isLoaded ) {
        if( error ) {
            return (<div className="error">Sorry! No kitty for you :-(</div>);
        }
        const dims = getSizedDimensions(kitty)
        return (
            <>
            <img src={kitty.url} alt="A kitty" width={dims.width} height={dims.height} />
            </>
        );
    }
    return (
        <>
        <img src={loadingUrl} alt="Loading…" width={maxDimension} height={maxDimension} />
        </>
    );
}

export default Kitty;