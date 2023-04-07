

class CommanHelper {
    randomNo = (min, max) => {
        const number = Math.floor(Math.random() * (max - min) + min);
        console.log("random helper", number);
        return number;
    }
    createSlug = (text) => {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }
   
}
export default new CommanHelper();

//export function value


/* export const  randomNo= (min,max)=>{
       const number = Math.floor( Math.random() * (max - min) + min);
       console.log("number",number);
       return number;
    } */
