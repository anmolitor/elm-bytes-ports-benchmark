port module HttpTask exposing (Msg, subscriptions, update)

import Bytes exposing (Bytes)
import Http
import Model exposing (Model)
import Util


port httpTriggerSend : (() -> msg) -> Sub msg


type Msg
    = PostBytes
    | PostedBytes (Result Http.Error ())


post : Bytes -> Cmd Msg
post bytes =
    Http.post { url = "elm://", body = Http.bytesBody "" bytes, expect = Http.expectWhatever PostedBytes }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PostBytes ->
            ( model, post model.bytes )

        PostedBytes b ->
            Debug.log (Debug.toString b) ( model, Cmd.none )


subscriptions : model -> Sub Msg
subscriptions _ =
    httpTriggerSend (\_ -> PostBytes)
