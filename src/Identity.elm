port module Identity exposing (Msg, subscriptions, update)

import Json.Encode
import Model exposing (Model)
import Ports exposing (receivedBytes)


port identityFromJS : (Json.Encode.Value -> msg) -> Sub msg


port identityTriggerSend : (() -> msg) -> Sub msg


port identityToJS : Json.Encode.Value -> Cmd msg


type Msg
    = GotValue Json.Encode.Value
    | SendBytes


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        GotValue value ->
            ( { model | value = value }, receivedBytes 0 )

        SendBytes ->
            ( model, identityToJS model.value )


subscriptions : a -> Sub Msg
subscriptions _ =
    Sub.batch
        [ identityFromJS GotValue
        , identityTriggerSend (\_ -> SendBytes)
        ]
