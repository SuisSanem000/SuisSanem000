import {useRouteError} from "react-router-dom";

export default ErrorPage;

function ErrorPage() {
    const error = useRouteError();
    return (
        <div id="error-page">
            <h1 className="h1-600">Oops!</h1>
            <p className="subtitle-500">Sorry, an unexpected error has occurred.</p>
            <p className="subtitle-500">
                {error.statusText || error.message}
            </p>
        </div>
    )
}