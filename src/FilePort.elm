port module FilePort exposing (Msg, subscriptions, update)

import Bytes exposing (Bytes)
import File
import Json.Decode
import Json.Encode
import Model exposing (Model)
import Ports exposing (receivedBytes)
import Task


port fileFromJS : (Json.Encode.Value -> msg) -> Sub msg


type Msg
    = GotFile (Result Json.Decode.Error File.File)
    | GotBytes Bytes


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotFile (Ok file) ->
            ( model, File.toBytes file |> Task.perform GotBytes )

        GotFile (Err _) ->
            ( model, Cmd.none )

        GotBytes bytes ->
            ( { model | bytes = bytes }, receivedBytes (Bytes.width bytes) )


subscriptions : a -> Sub Msg
subscriptions _ =
    fileFromJS (Json.Decode.decodeValue File.decoder >> GotFile)
