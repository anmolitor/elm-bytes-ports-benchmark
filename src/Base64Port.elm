port module Base64Port exposing (Msg, subscriptions, update)

import Array exposing (Array)
import Base64
import Bytes exposing (Bytes)
import Bytes.Decode
import Bytes.Encode
import Json.Decode
import Json.Encode
import Model exposing (Model)
import Ports exposing (receivedBytes)
import Util


port base64FromJS : (Json.Encode.Value -> msg) -> Sub msg


port base64ToJS : Json.Encode.Value -> Cmd msg


port base64TriggerSend : (() -> msg) -> Sub msg


type Msg
    = GotBytes Bytes
    | SendBytes


bytesEncoder : Bytes -> Json.Encode.Value
bytesEncoder bytes =
    Base64.fromBytes bytes
        |> Maybe.withDefault ""
        |> Json.Encode.string


bytesDecoder : Json.Decode.Decoder Bytes
bytesDecoder =
    Json.Decode.string
        |> Json.Decode.map (Base64.toBytes >> Maybe.withDefault Util.noBytes)


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        GotBytes bytes ->
            ( { model | bytes = bytes }, receivedBytes <| Bytes.width bytes )

        SendBytes ->
            ( model, base64ToJS (bytesEncoder model.bytes) )


subscriptions : a -> Sub Msg
subscriptions _ =
    Sub.batch
        [ base64FromJS (Json.Decode.decodeValue bytesDecoder >> Result.withDefault Util.noBytes >> GotBytes)
        , base64TriggerSend (\_ -> SendBytes)
        ]
