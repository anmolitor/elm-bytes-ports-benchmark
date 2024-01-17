port module HttpTask exposing (Msg, subscriptions, update)

import Bytes exposing (Bytes)
import Http
import Model exposing (Model)
import Ports exposing (receivedBytes)
import Util


port httpTriggerGet : (() -> msg) -> Sub msg


port httpTriggerSend : (() -> msg) -> Sub msg


type Msg
    = PostBytes
    | GetBytes
    | GotBytes Bytes
    | PostedBytes (Result Http.Error ())


get : Cmd Msg
get =
    Http.get
        { url = "elm://get"
        , expect =
            Http.expectBytesResponse (Result.withDefault Util.noBytes >> GotBytes)
                (\response ->
                    case response of
                        Http.GoodStatus_ _ bytes ->
                            Ok bytes

                        _ ->
                            Ok Util.noBytes
                )
        }


post : Bytes -> Cmd Msg
post bytes =
    Http.post { url = "elm://post", body = Http.bytesBody "" bytes, expect = Http.expectWhatever PostedBytes }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PostBytes ->
            ( model, post model.bytes )

        GetBytes ->
            ( model, get )

        GotBytes bytes ->
            ( { model | bytes = bytes }, receivedBytes (Bytes.width bytes) )

        PostedBytes _ ->
            ( model, Cmd.none )


subscriptions : model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ httpTriggerSend (\_ -> PostBytes)
        , httpTriggerGet (\_ -> GetBytes)
        ]
