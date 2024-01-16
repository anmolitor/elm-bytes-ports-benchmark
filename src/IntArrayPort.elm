port module IntArrayPort exposing (Msg, subscriptions, update)

import Array exposing (Array)
import Bytes exposing (Bytes)
import Bytes.Decode
import Bytes.Encode
import Json.Decode
import Json.Encode
import Model exposing (Model)
import Ports exposing (receivedBytes)
import Util


port intArrayFromJS : (Json.Encode.Value -> msg) -> Sub msg


port intArrayTriggerSend : (() -> msg) -> Sub msg


port intArrayToJS : Json.Encode.Value -> Cmd msg


type Msg
    = GotBytes Bytes
    | SendBytes


bytesEncoder : Bytes -> Json.Encode.Value
bytesEncoder bytes =
    Bytes.Decode.decode (Bytes.Decode.loop ( Bytes.width bytes, Array.empty ) listStep) bytes
        |> Maybe.withDefault Array.empty
        |> Json.Encode.array Json.Encode.int


bytesDecoder : Json.Decode.Decoder Bytes
bytesDecoder =
    Json.Decode.list Json.Decode.int
        |> Json.Decode.map (List.map Bytes.Encode.unsignedInt8 >> Bytes.Encode.sequence >> Bytes.Encode.encode)


listStep : ( Int, Array Int ) -> Bytes.Decode.Decoder (Bytes.Decode.Step ( Int, Array Int ) (Array Int))
listStep ( n, xs ) =
    if n <= 0 then
        Bytes.Decode.succeed (Bytes.Decode.Done xs)

    else
        Bytes.Decode.map (\x -> Bytes.Decode.Loop ( n - 1, Array.push x xs )) Bytes.Decode.unsignedInt8


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        GotBytes bytes ->
            ( { model | bytes = bytes }, receivedBytes <| Bytes.width bytes )

        SendBytes ->
            ( model, intArrayToJS (bytesEncoder model.bytes) )


subscriptions : a -> Sub Msg
subscriptions _ =
    Sub.batch
        [ intArrayFromJS (Json.Decode.decodeValue bytesDecoder >> Result.withDefault Util.noBytes >> GotBytes)
        , intArrayTriggerSend (\_ -> SendBytes)
        ]
